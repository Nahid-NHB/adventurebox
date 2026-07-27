import { describe, expect, it } from '@jest/globals';
import { checkSafety, usesOnlyAvailableMaterials } from '../safety';
import type { ActivityDraft } from '@/types/domain';

function draft(over: Partial<ActivityDraft> = {}): ActivityDraft {
  return {
    title: 'Test Activity',
    storyIntro: 'A gentle little adventure to try.',
    mission: 'Do the thing.',
    objective: 'Finish the thing.',
    steps: ['Step one goes here.'],
    safetyTips: [],
    learningExplanation: 'This teaches a useful idea about the world.',
    reflectionQuestions: ['What did you notice?'],
    category: 'art',
    skills: ['creativity'],
    minAge: 4,
    maxAge: 8,
    minTime: 10,
    maxTime: 20,
    materialsRequired: ['paper'],
    indoorOutdoor: 'indoor',
    weatherTags: ['any'],
    energyLevel: 'calm',
    difficulty: 'easy',
    ...over,
  };
}

describe('checkSafety', () => {
  it('accepts a benign age-appropriate activity', () => {
    expect(checkSafety(draft(), 6).safe).toBe(true);
  });

  it('rejects hazardous content for young children', () => {
    const r = checkSafety(draft({ steps: ['Light a match and hold the flame.'] }), 4);
    expect(r.safe).toBe(false);
    expect(r.reasons.join(' ')).toMatch(/hazard/i);
  });

  it('allows hazard words for older kids only with safety tips', () => {
    const noTips = checkSafety(
      draft({ minAge: 8, maxAge: 12, steps: ['Use a knife carefully.'], safetyTips: [] }),
      10,
    );
    expect(noTips.safe).toBe(false);

    const withTips = checkSafety(
      draft({
        minAge: 8,
        maxAge: 12,
        steps: ['Use a knife carefully.'],
        safetyTips: ['An adult should supervise the cutting.'],
      }),
      10,
    );
    expect(withTips.safe).toBe(true);
  });

  it('rejects choking-risk materials for toddlers', () => {
    const r = checkSafety(draft({ minAge: 3, materialsRequired: ['balloons'] }), 3);
    expect(r.safe).toBe(false);
    expect(r.reasons.join(' ')).toMatch(/choking/i);
  });

  it('rejects an activity whose age band excludes the child', () => {
    expect(checkSafety(draft({ minAge: 8, maxAge: 12 }), 4).safe).toBe(false);
  });

  it('rejects inverted age or time ranges', () => {
    expect(checkSafety(draft({ minAge: 10, maxAge: 4 }), 6).safe).toBe(false);
    expect(checkSafety(draft({ minTime: 30, maxTime: 10 }), 6).safe).toBe(false);
  });
});

describe('usesOnlyAvailableMaterials', () => {
  it('is true when all required materials are owned', () => {
    expect(usesOnlyAvailableMaterials(draft({ materialsRequired: ['paper'] }), ['paper', 'tape'])).toBe(true);
  });
  it('is false when a required material is missing', () => {
    expect(usesOnlyAvailableMaterials(draft({ materialsRequired: ['glue'] }), ['paper'])).toBe(false);
  });
});
