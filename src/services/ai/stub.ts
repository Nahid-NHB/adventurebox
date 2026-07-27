/**
 * Offline AI stub. Returns deterministic, safe activity drafts derived from the
 * context so the whole generation pipeline (validate -> safety -> dedupe ->
 * insert) can run with no network and no key. Good enough to demo and test.
 */
import type { AIProvider } from './index';
import type { ActivityDraft, GenContext } from '@/types/domain';
import { ok, type Result } from '@/lib/result';
import { seededRandom } from '@/lib/rng';

const TEMPLATES: Array<(ctx: GenContext) => ActivityDraft> = [
  (ctx) => ({
    title: 'Build a Tower of Cups',
    storyIntro: 'The little builders need a skyscraper. How high can you stack before it wobbles?',
    mission: 'Stack household cups or blocks into the tallest tower you can.',
    objective: 'Beat your own record by one level.',
    steps: [
      'Gather cups, blocks, or boxes.',
      'Stack them one at a time.',
      'Count how high you got before it fell.',
      'Rebuild and try to beat it.',
    ],
    safetyTips: ['Build away from breakables.'],
    learningExplanation: 'Stacking teaches balance and steady hands.',
    reflectionQuestions: ['What made it fall?', 'How could you make the base stronger?'],
    parentTip: 'Cheer the rebuild, not just the record.',
    category: 'engineering',
    skills: ['engineering', 'motor'],
    minAge: Math.max(3, ctx.child.age - 1),
    maxAge: ctx.child.age + 2,
    minTime: 10,
    maxTime: Math.max(20, ctx.timeBudget),
    materialsRequired: [],
    indoorOutdoor: 'indoor',
    weatherTags: ['any'],
    energyLevel: 'medium',
    difficulty: 'easy',
  }),
  (ctx) => ({
    title: 'Nature Treasure Hunt',
    storyIntro: 'The outdoors is full of tiny treasures. Can you find them all?',
    mission: 'Find five natural treasures outside.',
    objective: 'Collect five different natural items and sort them.',
    steps: [
      'Head outside with a small bag.',
      'Find five different natural things.',
      'Sort them by colour or size.',
      'Tell a story about your favourite.',
    ],
    safetyTips: ['Wash hands afterwards.', 'Stay where a grown-up can see you.'],
    learningExplanation: 'Collecting and sorting builds observation and early science.',
    reflectionQuestions: ['Which treasure was rarest?', 'How did you sort them?'],
    parentTip: 'Ask where they think each item came from.',
    category: 'nature',
    skills: ['observation', 'stem'],
    minAge: Math.max(3, ctx.child.age - 1),
    maxAge: ctx.child.age + 3,
    minTime: 15,
    maxTime: Math.max(30, ctx.timeBudget),
    materialsRequired: [],
    indoorOutdoor: 'outdoor',
    weatherTags: ['sunny', 'windy', 'any'],
    energyLevel: 'active',
    difficulty: 'easy',
  }),
];

export class StubAIProvider implements AIProvider {
  async generateActivities(
    ctx: GenContext,
    count: number,
  ): Promise<Result<ActivityDraft[]>> {
    const rand = seededRandom(`stub-${ctx.child.age}-${ctx.weather}-${ctx.timeBudget}`);
    const drafts: ActivityDraft[] = [];
    for (let i = 0; i < count; i++) {
      const t = TEMPLATES[Math.floor(rand() * TEMPLATES.length)];
      drafts.push(t(ctx));
    }
    return ok(drafts);
  }
}
