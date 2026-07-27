import { describe, expect, it } from '@jest/globals';
import { parseDrafts } from '../openrouter';
import type { ActivityDraft } from '@/types/domain';

const valid: ActivityDraft = {
  title: 'Cup Stacking',
  storyIntro: 'Stack them high, little architect.',
  mission: 'Stack cups into a pyramid.',
  objective: 'Build a three-level pyramid.',
  steps: ['Line up the cups.', 'Stack them up.'],
  safetyTips: [],
  learningExplanation: 'Balance and steady hands, plus a little geometry.',
  reflectionQuestions: ['What made it stable?'],
  category: 'engineering',
  skills: ['motor', 'engineering'],
  minAge: 4,
  maxAge: 8,
  minTime: 10,
  maxTime: 20,
  materialsRequired: [],
  indoorOutdoor: 'indoor',
  weatherTags: ['any'],
  energyLevel: 'medium',
  difficulty: 'easy',
};

describe('parseDrafts', () => {
  it('parses a bare JSON array', () => {
    const r = parseDrafts(JSON.stringify([valid]));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toHaveLength(1);
  });

  it('parses an object wrapping activities', () => {
    const r = parseDrafts(JSON.stringify({ activities: [valid] }));
    expect(r.ok).toBe(true);
  });

  it('drops invalid entries but keeps valid ones', () => {
    const r = parseDrafts(JSON.stringify([valid, { title: 'nope' }]));
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toHaveLength(1);
  });

  it('fails on non-JSON', () => {
    const r = parseDrafts('not json');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe('validation');
  });

  it('fails when nothing is valid', () => {
    const r = parseDrafts(JSON.stringify([{ foo: 1 }]));
    expect(r.ok).toBe(false);
  });
});
