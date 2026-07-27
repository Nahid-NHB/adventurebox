import { describe, expect, it } from '@jest/globals';
import {
  pickActivity,
  rankActivities,
  scoreActivity,
  targetDifficulty,
} from '../matchingEngine';
import { fingerprint } from '../fingerprint';
import type { Activity, GenContext } from '@/types/domain';
import { CURATED_ACTIVITIES } from '@/database/seed/activities';

function ctx(over: Partial<GenContext> = {}): GenContext {
  return {
    child: { age: 6, interests: [], learningGoals: ['stem'], energyDefault: 'medium' },
    materials: ['paper', 'tape', 'water', 'markers', 'boxes', 'kitchen'],
    environment: 'apartment',
    timeBudget: 20,
    weather: 'sunny',
    indoorOutdoorPref: 'either',
    recentFingerprints: [],
    successRate: 0.5,
    ...over,
  };
}

describe('targetDifficulty', () => {
  it('scales with success rate', () => {
    expect(targetDifficulty(0.9)).toBe('hard');
    expect(targetDifficulty(0.5)).toBe('medium');
    expect(targetDifficulty(0.1)).toBe('easy');
  });
});

describe('rankActivities', () => {
  it('is deterministic for the same seed', () => {
    const a = rankActivities(CURATED_ACTIVITIES, ctx(), 'seed-1').map((s) => s.activity.id);
    const b = rankActivities(CURATED_ACTIVITIES, ctx(), 'seed-1').map((s) => s.activity.id);
    expect(a).toEqual(b);
  });

  it('varies ordering across different seeds', () => {
    const a = rankActivities(CURATED_ACTIVITIES, ctx(), 'seed-A').map((s) => s.activity.id);
    const b = rankActivities(CURATED_ACTIVITIES, ctx(), 'seed-B').map((s) => s.activity.id);
    expect(a).not.toEqual(b);
  });

  it('filters out activities outside the age band', () => {
    const ranked = rankActivities(CURATED_ACTIVITIES, ctx({ child: { age: 3, interests: [], learningGoals: [], energyDefault: 'calm' } }), 's');
    for (const r of ranked) {
      expect(r.activity.minAge).toBeLessThanOrEqual(3);
      expect(r.activity.maxAge).toBeGreaterThanOrEqual(3);
    }
  });

  it('excludes activities needing materials the family lacks', () => {
    const ranked = rankActivities(CURATED_ACTIVITIES, ctx({ materials: [] }), 's');
    for (const r of ranked) {
      // With no materials, only zero-material activities survive the >=0.5 filter.
      expect(r.activity.materialsRequired.length).toBe(0);
    }
  });
});

describe('scoreActivity novelty', () => {
  it('penalizes recently served activities', () => {
    const target = CURATED_ACTIVITIES[0];
    const base = scoreActivity(target, ctx());
    const penalized = scoreActivity(target, ctx({ recentFingerprints: [fingerprint(target)] }));
    expect(penalized.score).toBeLessThan(base.score);
  });
});

describe('pickActivity', () => {
  it('returns a stable pick for offset 0 and a different one for offset 1', () => {
    const first = pickActivity(CURATED_ACTIVITIES, ctx(), 'day:child', 0);
    const again = pickActivity(CURATED_ACTIVITIES, ctx(), 'day:child', 0);
    const another = pickActivity(CURATED_ACTIVITIES, ctx(), 'day:child', 1);
    expect(first?.id).toBe(again?.id);
    expect(another?.id).not.toBe(first?.id);
  });

  it('returns null when nothing is eligible', () => {
    const empty: Activity[] = [];
    expect(pickActivity(empty, ctx(), 's', 0)).toBeNull();
  });
});
