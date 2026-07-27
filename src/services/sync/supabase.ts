/**
 * Real sync backed by Supabase. Push-then-pull with a last-write-wins policy.
 *
 * Push: drains the local outbox (already coalesced), rewrites the local
 * placeholder family id to the authenticated family id, and upserts/deletes the
 * corresponding Supabase rows. Idempotent via the client-generated ids.
 *
 * Pull: fetches rows updated since the last sync and mirrors them into SQLite so
 * a second device sees them. Curated activities are seeded locally, so pull only
 * needs AI activities + family data.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { SyncService } from './index';
import type { SyncItem } from '@/lib/syncQueue';
import { ok, err, type Result } from '@/lib/result';
import { getSupabase } from '../supabase';
import { LOCAL_FAMILY_ID } from '../config';
import { syncQueueRepo, activitiesRepo, familyRepo } from '@/database';
import { kv } from '../kv';

const LAST_SYNC_KEY = 'lastSyncedAt';

/** Map an outbox entity to its Supabase table name. */
const TABLE: Record<string, string> = {
  children: 'children',
  family_settings: 'family_settings',
  assignments: 'assignments',
  streaks: 'streaks',
  favorites: 'favorites',
  journal_entries: 'journal_entries',
  activities: 'activities',
};

async function resolveFamilyId(sb: SupabaseClient): Promise<string | null> {
  const { data } = await sb.from('families').select('id').limit(1).maybeSingle();
  return data?.id ?? null;
}

/** Rewrite the local placeholder family id to the real one within a payload. */
function withFamilyId(payload: Record<string, unknown>, familyId: string): Record<string, unknown> {
  const out = { ...payload };
  for (const k of ['familyId', 'family_id']) {
    if (out[k] === LOCAL_FAMILY_ID) out[k] = familyId;
  }
  if (!('family_id' in out) && 'familyId' in out) out.family_id = out.familyId;
  return out;
}

export class SupabaseSyncService implements SyncService {
  async pushOutbox(): Promise<Result<{ pushed: number }>> {
    const sb = getSupabase();
    if (!sb) return err('unauthorized', 'Supabase not configured.');
    const familyId = await resolveFamilyId(sb);
    if (!familyId) return err('unauthorized', 'No family for the current user.');

    const pending = await syncQueueRepo.getPendingCoalesced();
    const done: string[] = [];

    for (const item of pending) {
      const table = TABLE[item.entity];
      if (!table) {
        done.push(item.id); // unknown entity, drop it
        continue;
      }
      const okItem = await pushItem(sb, table, item, familyId);
      if (okItem) done.push(item.id);
    }

    await syncQueueRepo.markSynced(done);
    return ok({ pushed: done.length });
  }

  async pullSince(sinceIso: string | null): Promise<Result<{ pulled: number }>> {
    const sb = getSupabase();
    if (!sb) return err('unauthorized', 'Supabase not configured.');
    const since = sinceIso ?? '1970-01-01T00:00:00.000Z';
    let pulled = 0;

    // AI activities are the main thing another device needs mirrored locally.
    const { data: acts } = await sb
      .from('activities')
      .select('*')
      .eq('source', 'ai')
      .gt('created_at', since);
    for (const row of acts ?? []) {
      await activitiesRepo.upsertActivity(fromActivityRow(row));
      pulled++;
    }

    // Children + settings (so a reinstall restores the profile).
    const { data: kids } = await sb.from('children').select('*').gt('updated_at', since);
    for (const c of kids ?? []) {
      await familyRepo.upsertChild(fromChildRow(c));
      pulled++;
    }

    await kv.set(LAST_SYNC_KEY, new Date().toISOString());
    return ok({ pulled });
  }

  async fullSync(): Promise<Result<{ pushed: number; pulled: number }>> {
    const push = await this.pushOutbox();
    if (!push.ok) return push;
    const pull = await this.pullSince(kv.getString(LAST_SYNC_KEY) ?? null);
    if (!pull.ok) return pull;
    return ok({ pushed: push.value.pushed, pulled: pull.value.pulled });
  }
}

async function pushItem(
  sb: SupabaseClient,
  table: string,
  item: SyncItem,
  familyId: string,
): Promise<boolean> {
  try {
    if (item.op === 'delete') {
      const payload = withFamilyId((item.payload ?? {}) as Record<string, unknown>, familyId);
      if (table === 'favorites') {
        await sb
          .from('favorites')
          .delete()
          .eq('family_id', familyId)
          .eq('activity_id', payload.activityId as string);
      }
      return true;
    }
    const row = toRow(table, withFamilyId((item.payload ?? {}) as Record<string, unknown>, familyId));
    const { error } = await sb.from(table).upsert(row);
    return !error;
  } catch {
    return false;
  }
}

// ---- payload <-> Supabase row shape --------------------------------------
// Local payloads are camelCase domain objects; Supabase columns are snake_case.

function toRow(table: string, p: Record<string, unknown>): Record<string, unknown> {
  const base: Record<string, unknown> = { family_id: p.family_id ?? p.familyId };
  switch (table) {
    case 'children':
      return {
        id: p.id,
        ...base,
        name: p.name,
        age: p.age,
        interests: p.interests,
        favorite_colors: p.favoriteColors,
        learning_goals: p.learningGoals,
        energy_default: p.energyDefault,
      };
    case 'family_settings':
      return {
        ...base,
        materials: p.materials,
        environment: p.environment,
        default_time_minutes: p.defaultTimeMinutes,
        indoor_outdoor_pref: p.indoorOutdoorPref,
        notify_hour: p.notifyHour,
      };
    case 'assignments':
      return {
        id: p.id,
        ...base,
        child_id: p.childId,
        activity_id: p.activityId,
        date: p.date,
        status: p.status,
        started_at: p.startedAt,
        completed_at: p.completedAt,
      };
    case 'streaks':
      return {
        ...base,
        current_streak: p.currentStreak,
        longest_streak: p.longestStreak,
        last_completed_date: p.lastCompletedDate,
        explorer_level: p.explorerLevel,
        xp: p.xp,
      };
    case 'favorites':
      return { ...base, activity_id: p.activityId, created_at: p.createdAt };
    case 'journal_entries':
      return {
        id: p.id,
        ...base,
        assignment_id: p.assignmentId,
        child_id: p.childId,
        activity_id: p.activityId,
        before_photo_key: p.beforePhotoKey,
        after_photo_key: p.afterPhotoKey,
        child_comment: p.childComment,
        learning_note: p.learningNote,
        created_at: p.createdAt,
      };
    case 'activities':
      return {
        id: p.id,
        ...base,
        source: p.source,
        status: p.status,
        premium_pack: p.premiumPack,
        title: p.title,
        story_intro: p.storyIntro,
        mission: p.mission,
        objective: p.objective,
        steps: p.steps,
        safety_tips: p.safetyTips,
        learning_explanation: p.learningExplanation,
        reflection_questions: p.reflectionQuestions,
        parent_tip: p.parentTip,
        category: p.category,
        skills: p.skills,
        min_age: p.minAge,
        max_age: p.maxAge,
        min_time: p.minTime,
        max_time: p.maxTime,
        materials_required: p.materialsRequired,
        indoor_outdoor: p.indoorOutdoor,
        weather_tags: p.weatherTags,
        energy_level: p.energyLevel,
        difficulty: p.difficulty,
        created_at: p.createdAt,
      };
    default:
      return p;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromActivityRow(r: any) {
  return {
    id: r.id,
    source: r.source,
    status: r.status,
    premiumPack: r.premium_pack ?? null,
    title: r.title,
    storyIntro: r.story_intro,
    mission: r.mission,
    objective: r.objective,
    steps: r.steps,
    safetyTips: r.safety_tips,
    learningExplanation: r.learning_explanation,
    reflectionQuestions: r.reflection_questions,
    parentTip: r.parent_tip ?? undefined,
    category: r.category,
    skills: r.skills,
    minAge: r.min_age,
    maxAge: r.max_age,
    minTime: r.min_time,
    maxTime: r.max_time,
    materialsRequired: r.materials_required,
    indoorOutdoor: r.indoor_outdoor,
    weatherTags: r.weather_tags,
    energyLevel: r.energy_level,
    difficulty: r.difficulty,
    createdAt: r.created_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromChildRow(r: any) {
  return {
    id: r.id,
    familyId: LOCAL_FAMILY_ID,
    name: r.name,
    age: r.age,
    interests: r.interests ?? [],
    favoriteColors: r.favorite_colors ?? [],
    learningGoals: r.learning_goals ?? [],
    energyDefault: r.energy_default,
  };
}
