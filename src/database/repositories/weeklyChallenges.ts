/**
 * Weekly challenge persistence. One row per (family, week). The row is created
 * lazily the first time the current week is read, seeded from the deterministic
 * rotation so it matches what the pure logic would pick. Completions bump the
 * count and enqueue to the sync outbox like every other local mutation.
 */
import type { Category, WeeklyChallengeProgress } from '@/types/domain';
import { getDb } from '../client';
import { rowToChallengeProgress, type ChallengeProgressRow } from '../mappers';
import {
  applyChallengeProgress,
  challengeById,
  emptyProgress,
  pickChallenge,
  weekKey,
  type WeeklyChallengeDef,
} from '@/lib/weeklyChallenge';
import { enqueue } from './syncQueue';

const COLS = 'family_id, week_key, challenge_id, count, target, completed_at';

export interface CurrentChallenge {
  def: WeeklyChallengeDef;
  progress: WeeklyChallengeProgress;
}

async function save(
  db: Awaited<ReturnType<typeof getDb>>,
  p: WeeklyChallengeProgress,
): Promise<void> {
  await db.runAsync(
    `INSERT OR REPLACE INTO weekly_challenge_progress (${COLS}) VALUES (?, ?, ?, ?, ?, ?);`,
    [p.familyId, p.weekKey, p.challengeId, p.count, p.target, p.completedAt],
  );
}

/** The active challenge for this week, creating the row on first read. */
export async function getCurrentChallenge(
  familyId: string,
  week: string = weekKey(),
): Promise<CurrentChallenge> {
  const db = await getDb();
  const row = await db.getFirstAsync<ChallengeProgressRow>(
    'SELECT * FROM weekly_challenge_progress WHERE family_id = ? AND week_key = ?;',
    [familyId, week],
  );
  if (row) {
    const progress = rowToChallengeProgress(row);
    return { def: challengeById(progress.challengeId, week), progress };
  }
  const def = pickChallenge(week);
  const progress = emptyProgress(familyId, week, def);
  await save(db, progress);
  return { def, progress };
}

/**
 * Record a completed activity against the current week. Returns whether the
 * challenge was just completed so callers can celebrate / award the bonus once.
 */
export async function bumpForCompletion(
  familyId: string,
  category: Category,
  now: Date = new Date(),
): Promise<CurrentChallenge & { justCompleted: boolean }> {
  const db = await getDb();
  const week = weekKey(now);
  const { def, progress } = await getCurrentChallenge(familyId, week);
  const { progress: next, justCompleted } = applyChallengeProgress(
    progress,
    def,
    category,
    now.toISOString(),
  );
  if (next !== progress) {
    await save(db, next);
    await enqueue('weekly_challenges', `${familyId}:${week}`, 'update', next);
  }
  return { def, progress: next, justCompleted };
}
