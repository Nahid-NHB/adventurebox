import { describe, expect, it } from '@jest/globals';
import {
  WEEKLY_CHALLENGES,
  applyChallengeProgress,
  challengeById,
  emptyProgress,
  isChallengeComplete,
  matchesChallenge,
  pickChallenge,
  weekKey,
} from '../weeklyChallenge';

describe('weekKey', () => {
  it('produces an ISO week key', () => {
    // 2026-07-27 is a Monday in ISO week 31.
    expect(weekKey(new Date('2026-07-27T10:00:00'))).toBe('2026-W31');
  });

  it('is stable across days within the same ISO week', () => {
    const mon = weekKey(new Date('2026-07-27T08:00:00'));
    const sun = weekKey(new Date('2026-08-02T23:00:00'));
    expect(mon).toBe(sun);
  });

  it('rolls over to the next week on the following Monday', () => {
    const w31 = weekKey(new Date('2026-07-27T08:00:00'));
    const w32 = weekKey(new Date('2026-08-03T08:00:00'));
    expect(w31).not.toBe(w32);
  });
});

describe('pickChallenge', () => {
  it('is deterministic for a given week', () => {
    expect(pickChallenge('2026-W31').id).toBe(pickChallenge('2026-W31').id);
  });

  it('always returns a challenge from the pool', () => {
    for (let w = 1; w <= 52; w++) {
      const key = `2026-W${String(w).padStart(2, '0')}`;
      expect(WEEKLY_CHALLENGES).toContain(pickChallenge(key));
    }
  });

  it('rotates across weeks (not always the same one)', () => {
    const ids = new Set(
      Array.from({ length: 12 }, (_, i) => pickChallenge(`2026-W${String(i + 1).padStart(2, '0')}`).id),
    );
    expect(ids.size).toBeGreaterThan(1);
  });
});

describe('challengeById', () => {
  it('finds a known id', () => {
    expect(challengeById('curious-five', '2026-W31').id).toBe('curious-five');
  });

  it('falls back to the week rotation for an unknown id', () => {
    expect(challengeById('gone', '2026-W31').id).toBe(pickChallenge('2026-W31').id);
  });
});

describe('matchesChallenge', () => {
  const anyDef = WEEKLY_CHALLENGES.find((c) => c.filter === 'any')!;
  const outdoor = WEEKLY_CHALLENGES.find((c) => c.filter === 'outdoor')!;

  it("'any' matches every category", () => {
    expect(matchesChallenge(anyDef, 'science')).toBe(true);
    expect(matchesChallenge(anyDef, 'art')).toBe(true);
  });

  it('a category filter matches only that category', () => {
    expect(matchesChallenge(outdoor, 'outdoor')).toBe(true);
    expect(matchesChallenge(outdoor, 'science')).toBe(false);
  });
});

describe('applyChallengeProgress', () => {
  const def = WEEKLY_CHALLENGES.find((c) => c.id === 'curious-five')!; // any, target 5

  it('ignores a non-matching category', () => {
    const outdoor = WEEKLY_CHALLENGES.find((c) => c.filter === 'outdoor')!;
    const p = emptyProgress('fam', '2026-W31', outdoor);
    const step = applyChallengeProgress(p, outdoor, 'science', '2026-07-27T10:00:00Z');
    expect(step.progress).toBe(p); // unchanged reference
    expect(step.justCompleted).toBe(false);
  });

  it('increments on a matching completion', () => {
    const p = emptyProgress('fam', '2026-W31', def);
    const step = applyChallengeProgress(p, def, 'science', '2026-07-27T10:00:00Z');
    expect(step.progress.count).toBe(1);
    expect(step.justCompleted).toBe(false);
    expect(step.progress.completedAt).toBeNull();
  });

  it('flags justCompleted exactly once when crossing the target', () => {
    let p = emptyProgress('fam', '2026-W31', def);
    let completions = 0;
    for (let i = 0; i < def.target + 2; i++) {
      const step = applyChallengeProgress(p, def, 'art', '2026-07-27T10:00:00Z');
      if (step.justCompleted) completions++;
      p = step.progress;
    }
    expect(completions).toBe(1);
    expect(isChallengeComplete(p)).toBe(true);
    expect(p.completedAt).toBe('2026-07-27T10:00:00Z');
  });

  it('keeps the original completedAt on later completions', () => {
    let p = emptyProgress('fam', '2026-W31', WEEKLY_CHALLENGES.find((c) => c.id === 'little-scientist')!);
    const def2 = WEEKLY_CHALLENGES.find((c) => c.id === 'little-scientist')!; // science, target 2
    p = applyChallengeProgress(p, def2, 'science', 'FIRST').progress;
    p = applyChallengeProgress(p, def2, 'science', 'SECOND').progress; // hits target 2
    const at = p.completedAt;
    p = applyChallengeProgress(p, def2, 'science', 'THIRD').progress;
    expect(p.completedAt).toBe(at);
    expect(p.completedAt).toBe('SECOND');
  });
});
