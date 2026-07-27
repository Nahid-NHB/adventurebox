/**
 * Weekly challenge rules. Pure so they are fully unit-tested and run on the hot
 * path with no I/O. Challenges are curated and rotate deterministically per
 * ISO week, so every family on the same week sees the same challenge and it is
 * stable across launches (no server needed). Progress is gentle: it only ever
 * counts up, never punishes a miss, and a completed week is a small reward, not
 * a demand.
 */
import type { Category, WeeklyChallengeProgress } from '@/types/domain';

export type ChallengeFilter = Category | 'any';

export interface WeeklyChallengeDef {
  id: string;
  title: string;
  description: string;
  /** How many matching activities complete the challenge. */
  target: number;
  /** Which activity category counts, or 'any' for every completion. */
  filter: ChallengeFilter;
  /** Badge emoji shown when the week is completed. */
  reward: string;
  /** Bonus Curiosity XP awarded once, on completion. */
  bonusXp: number;
}

/**
 * The rotation pool. Kept small and varied so a family sees a fresh theme each
 * week without repeating for a couple of months.
 */
export const WEEKLY_CHALLENGES: WeeklyChallengeDef[] = [
  {
    id: 'outdoor-explorer',
    title: 'Outdoor Explorer',
    description: 'Do 3 outdoor adventures this week.',
    target: 3,
    filter: 'outdoor',
    reward: '🌳',
    bonusXp: 30,
  },
  {
    id: 'little-scientist',
    title: 'Little Scientist',
    description: 'Finish 2 science experiments this week.',
    target: 2,
    filter: 'science',
    reward: '🔬',
    bonusXp: 25,
  },
  {
    id: 'master-builder',
    title: 'Master Builder',
    description: 'Complete 3 engineering builds this week.',
    target: 3,
    filter: 'engineering',
    reward: '🏗️',
    bonusXp: 30,
  },
  {
    id: 'art-week',
    title: 'Art Week',
    description: 'Create 3 art projects this week.',
    target: 3,
    filter: 'art',
    reward: '🎨',
    bonusXp: 30,
  },
  {
    id: 'nature-friend',
    title: 'Nature Friend',
    description: 'Explore nature 2 times this week.',
    target: 2,
    filter: 'nature',
    reward: '🦋',
    bonusXp: 25,
  },
  {
    id: 'curious-five',
    title: 'Curious Five',
    description: 'Complete any 5 adventures this week.',
    target: 5,
    filter: 'any',
    reward: '⭐',
    bonusXp: 40,
  },
  {
    id: 'kitchen-helper',
    title: 'Kitchen Helper',
    description: 'Cook up 2 activities this week.',
    target: 2,
    filter: 'cooking',
    reward: '🍳',
    bonusXp: 25,
  },
  {
    id: 'story-teller',
    title: 'Storyteller',
    description: 'Do 2 storytelling adventures this week.',
    target: 2,
    filter: 'storytelling',
    reward: '📖',
    bonusXp: 25,
  },
];

/** Deterministic 32-bit string hash (xfnv1a). */
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Canonical week key, ISO-8601 week (Monday start), e.g. "2026-W30". Used as
 * the primary key for a week's progress and as the seed for the rotation.
 */
export function weekKey(date: Date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7; // Mon=1 .. Sun=7
  d.setUTCDate(d.getUTCDate() + 4 - day); // shift to the week's Thursday
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

/** Deterministically pick the challenge for a given week key. */
export function pickChallenge(
  week: string,
  pool: WeeklyChallengeDef[] = WEEKLY_CHALLENGES,
): WeeklyChallengeDef {
  return pool[hashStr(week) % pool.length];
}

/** Look up a definition by id, falling back to the week's rotation pick. */
export function challengeById(
  id: string,
  week: string,
  pool: WeeklyChallengeDef[] = WEEKLY_CHALLENGES,
): WeeklyChallengeDef {
  return pool.find((c) => c.id === id) ?? pickChallenge(week, pool);
}

export function emptyProgress(
  familyId: string,
  week: string,
  def: WeeklyChallengeDef,
): WeeklyChallengeProgress {
  return {
    familyId,
    weekKey: week,
    challengeId: def.id,
    count: 0,
    target: def.target,
    completedAt: null,
  };
}

/** Does a completed activity's category count toward this challenge? */
export function matchesChallenge(def: WeeklyChallengeDef, category: Category): boolean {
  return def.filter === 'any' || def.filter === category;
}

export function isChallengeComplete(p: WeeklyChallengeProgress): boolean {
  return p.count >= p.target;
}

export interface ChallengeStep {
  progress: WeeklyChallengeProgress;
  /** True only on the call that crosses the target, so callers award the bonus once. */
  justCompleted: boolean;
}

/**
 * Record one completion against the current week's progress. A non-matching
 * category leaves progress untouched. Already-completed weeks keep their
 * completedAt (bonus is never awarded twice).
 */
export function applyChallengeProgress(
  prev: WeeklyChallengeProgress,
  def: WeeklyChallengeDef,
  category: Category,
  nowIso: string,
): ChallengeStep {
  if (!matchesChallenge(def, category)) {
    return { progress: prev, justCompleted: false };
  }
  const count = prev.count + 1;
  const wasComplete = isChallengeComplete(prev);
  const nowComplete = count >= prev.target;
  const justCompleted = !wasComplete && nowComplete;
  return {
    progress: {
      ...prev,
      count,
      completedAt: nowComplete ? (prev.completedAt ?? nowIso) : prev.completedAt,
    },
    justCompleted,
  };
}
