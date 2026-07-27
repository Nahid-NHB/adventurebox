import { describe, expect, it } from '@jest/globals';
import { applyCompletion, emptyStreak, isStreakAlive, levelForXp } from '../streak';

describe('levelForXp', () => {
  it('follows the gentle curve', () => {
    expect(levelForXp(0)).toBe(1);
    expect(levelForXp(25)).toBe(2);
    expect(levelForXp(60)).toBe(3);
    expect(levelForXp(120)).toBe(4);
    expect(levelForXp(140)).toBe(5);
  });
});

describe('applyCompletion', () => {
  it('starts a streak at 1 on first completion', () => {
    const s = applyCompletion(emptyStreak('fam'), '2026-07-27');
    expect(s.currentStreak).toBe(1);
    expect(s.xp).toBe(10);
    expect(s.lastCompletedDate).toBe('2026-07-27');
  });

  it('increments on consecutive days', () => {
    let s = applyCompletion(emptyStreak('fam'), '2026-07-26');
    s = applyCompletion(s, '2026-07-27');
    expect(s.currentStreak).toBe(2);
    expect(s.longestStreak).toBe(2);
  });

  it('resets after a gap but keeps longest', () => {
    let s = applyCompletion(emptyStreak('fam'), '2026-07-20');
    s = applyCompletion(s, '2026-07-21');
    s = applyCompletion(s, '2026-07-25'); // gap
    expect(s.currentStreak).toBe(1);
    expect(s.longestStreak).toBe(2);
  });

  it('does not double-count the same day but still earns XP', () => {
    let s = applyCompletion(emptyStreak('fam'), '2026-07-27');
    s = applyCompletion(s, '2026-07-27');
    expect(s.currentStreak).toBe(1);
    expect(s.xp).toBe(20);
  });
});

describe('isStreakAlive', () => {
  it('is alive same day or next day, dead after a gap', () => {
    const s = applyCompletion(emptyStreak('fam'), '2026-07-27');
    expect(isStreakAlive(s, '2026-07-27')).toBe(true);
    expect(isStreakAlive(s, '2026-07-28')).toBe(true);
    expect(isStreakAlive(s, '2026-07-30')).toBe(false);
  });
});
