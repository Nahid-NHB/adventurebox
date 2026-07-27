import { describe, expect, it } from '@jest/globals';
import { filterDrafts } from '../generationFilter';
import { fingerprint } from '../fingerprint';
import type { ActivityDraft } from '@/types/domain';

function draft(over: Partial<ActivityDraft> = {}): ActivityDraft {
  return {
    title: 'Safe Craft',
    storyIntro: 'A calm little making adventure.',
    mission: 'Make something.',
    objective: 'Finish it.',
    steps: ['Fold the paper.'],
    safetyTips: [],
    learningExplanation: 'Teaches fine motor skills and planning.',
    reflectionQuestions: ['What was tricky?'],
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

describe('filterDrafts', () => {
  it('keeps safe, in-budget, novel drafts', () => {
    const out = filterDrafts({
      drafts: [draft()],
      targetAge: 6,
      availableMaterials: ['paper', 'tape'],
      existingFingerprints: [],
    });
    expect(out).toHaveLength(1);
  });

  it('drops unsafe drafts', () => {
    const out = filterDrafts({
      drafts: [draft({ steps: ['Use the hot stove.'] })],
      targetAge: 4,
      availableMaterials: ['paper'],
      existingFingerprints: [],
    });
    expect(out).toHaveLength(0);
  });

  it('drops drafts needing unavailable materials', () => {
    const out = filterDrafts({
      drafts: [draft({ materialsRequired: ['lego'] })],
      targetAge: 6,
      availableMaterials: ['paper'],
      existingFingerprints: [],
    });
    expect(out).toHaveLength(0);
  });

  it('drops duplicates of existing activities', () => {
    const d = draft();
    const out = filterDrafts({
      drafts: [d],
      targetAge: 6,
      availableMaterials: ['paper'],
      existingFingerprints: [fingerprint(d)],
    });
    expect(out).toHaveLength(0);
  });

  it('deduplicates within the same batch', () => {
    const out = filterDrafts({
      drafts: [draft(), draft()],
      targetAge: 6,
      availableMaterials: ['paper'],
      existingFingerprints: [],
    });
    expect(out).toHaveLength(1);
  });
});
