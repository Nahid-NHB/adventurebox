/**
 * Pure filter for the AI generation pipeline: keep only drafts that are safe,
 * use owned materials, and are not duplicates of what we already have. Kept
 * DB-free so it can be unit-tested in isolation.
 */
import type { ActivityDraft, Material } from '@/types/domain';
import { checkSafety, usesOnlyAvailableMaterials } from './safety';
import { fingerprint } from './fingerprint';

export interface FilterInput {
  drafts: ActivityDraft[];
  targetAge: number;
  availableMaterials: Material[];
  existingFingerprints: string[];
}

export function filterDrafts(input: FilterInput): ActivityDraft[] {
  const seen = new Set(input.existingFingerprints);
  const kept: ActivityDraft[] = [];
  for (const d of input.drafts) {
    if (!checkSafety(d, input.targetAge).safe) continue;
    if (!usesOnlyAvailableMaterials(d, input.availableMaterials)) continue;
    const fp = fingerprint(d);
    if (seen.has(fp)) continue;
    seen.add(fp);
    kept.push(d);
  }
  return kept;
}
