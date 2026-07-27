/**
 * Activity generation pipeline. Runs in the background when online; the home
 * screen never awaits it. Flow: generate -> validate (already zod-checked) ->
 * safety gate -> materials check -> dedupe -> insert into the local library.
 *
 * `filterDrafts` is pure and exported so the gate is unit-tested in isolation.
 */
import type { Activity, ActivityDraft, GenContext } from '@/types/domain';
import { fingerprint } from '@/lib/fingerprint';
import { filterDrafts } from '@/lib/generationFilter';
import { uuid } from '@/lib/id';
import { getAIProvider } from './index';
import { activitiesRepo } from '@/database';

export { filterDrafts } from '@/lib/generationFilter';

function draftToActivity(d: ActivityDraft): Activity {
  return {
    ...d,
    id: `ai-${uuid()}`,
    source: 'ai',
    status: 'approved',
    premiumPack: null,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Generate + persist fresh activities for a child. Returns how many were added.
 * Safe to call fire-and-forget; failures are swallowed (curated library covers).
 */
export async function runGeneration(
  ctx: GenContext,
  count = 4,
): Promise<number> {
  const provider = getAIProvider();
  const result = await provider.generateActivities(ctx, count);
  if (!result.ok) return 0;

  const existing = await activitiesRepo.getAllActivities();
  const kept = filterDrafts({
    drafts: result.value,
    targetAge: ctx.child.age,
    availableMaterials: ctx.materials,
    existingFingerprints: existing.map((a) => fingerprint(a)),
  });

  for (const d of kept) {
    await activitiesRepo.upsertActivity(draftToActivity(d));
  }
  return kept.length;
}
