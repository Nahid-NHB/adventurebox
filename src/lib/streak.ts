/**
 * Streak + explorer-level rules. Pure so they are fully unit-tested. These are
 * deliberately gentle: completing an activity keeps the streak, missing a day
 * resets it, and levels reward curiosity (total XP) rather than daily pressure.
 */
import type { Streak } from '@/types/domain';
import { daysBetween } from './date';

export const XP_PER_ACTIVITY = 10;

/** XP needed to reach a given level (gentle curve). Level 1 starts at 0 XP. */
export function levelForXp(xp: number): number {
  // 0-19 -> L1, 20-49 -> L2, 50-89 -> L3, then +50 per level.
  if (xp < 20) return 1;
  if (xp < 50) return 2;
  if (xp < 90) return 3;
  return 3 + Math.floor((xp - 90) / 50) + 1;
}

export function emptyStreak(familyId: string): Streak {
  return {
    familyId,
    currentStreak: 0,
    longestStreak: 0,
    lastCompletedDate: null,
    explorerLevel: 1,
    xp: 0,
  };
}

/**
 * Apply a completion on `todayKey`. Idempotent for the same day: completing a
 * second activity on the same day still earns XP but does not double-count the
 * streak day.
 */
export function applyCompletion(prev: Streak, todayKey: string): Streak {
  const xp = prev.xp + XP_PER_ACTIVITY;
  let current = prev.currentStreak;

  if (prev.lastCompletedDate === todayKey) {
    // Already counted today; only XP grows.
    current = prev.currentStreak || 1;
  } else if (prev.lastCompletedDate && daysBetween(prev.lastCompletedDate, todayKey) === 1) {
    current = prev.currentStreak + 1; // consecutive day
  } else {
    current = 1; // first ever, or a gap reset it
  }

  return {
    ...prev,
    xp,
    currentStreak: current,
    longestStreak: Math.max(prev.longestStreak, current),
    lastCompletedDate: todayKey,
    explorerLevel: levelForXp(xp),
  };
}

/** Recompute whether a stored streak is still "alive" as of today. */
export function isStreakAlive(s: Streak, todayKey: string): boolean {
  if (!s.lastCompletedDate) return false;
  const gap = daysBetween(s.lastCompletedDate, todayKey);
  return gap <= 1;
}
