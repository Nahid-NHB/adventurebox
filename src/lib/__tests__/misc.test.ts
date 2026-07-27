import { describe, expect, it } from '@jest/globals';
import { seededRandom, hashSeed } from '../rng';
import { todayKey, daysBetween, isConsecutive } from '../date';
import { fingerprint } from '../fingerprint';
import type { ActivityDraft } from '@/types/domain';

describe('rng', () => {
  it('is deterministic for a seed', () => {
    const a = seededRandom('x');
    const b = seededRandom('x');
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
  it('differs across seeds', () => {
    expect(hashSeed('a')).not.toBe(hashSeed('b'));
  });
});

describe('date', () => {
  it('formats YYYY-MM-DD', () => {
    expect(todayKey(new Date('2026-07-27T15:00:00'))).toBe('2026-07-27');
  });
  it('computes day gaps', () => {
    expect(daysBetween('2026-07-26', '2026-07-27')).toBe(1);
    expect(isConsecutive('2026-07-26', '2026-07-27')).toBe(true);
    expect(isConsecutive(null, '2026-07-27')).toBe(false);
  });
});

describe('fingerprint', () => {
  it('collides on same category/title/materials regardless of case', () => {
    const base: ActivityDraft = {
      title: 'Paper Bridge',
      storyIntro: 'x'.repeat(12),
      mission: 'build',
      objective: 'hold coins',
      steps: ['do it'],
      safetyTips: [],
      learningExplanation: 'y'.repeat(12),
      reflectionQuestions: ['why?'],
      category: 'engineering',
      skills: ['engineering'],
      minAge: 5,
      maxAge: 9,
      minTime: 10,
      maxTime: 20,
      materialsRequired: ['paper', 'tape'],
      indoorOutdoor: 'indoor',
      weatherTags: ['any'],
      energyLevel: 'calm',
      difficulty: 'easy',
    };
    const other: ActivityDraft = { ...base, title: 'PAPER  bridge', materialsRequired: ['tape', 'paper'] };
    expect(fingerprint(base)).toBe(fingerprint(other));
  });
});
