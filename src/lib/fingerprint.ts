import type { Activity, ActivityDraft } from '@/types/domain';
import { hashSeed } from './rng';

/**
 * A fingerprint identifies "the same kind of activity" for dedupe. Two drafts
 * with the same category + normalized title + material set collide, so the
 * generation pipeline and matching engine can avoid serving near-duplicates.
 */
export function fingerprint(a: Activity | ActivityDraft): string {
  const title = a.title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const mats = [...a.materialsRequired].sort().join(',');
  return `${a.category}|${title}|${mats}`;
}

/** Stable short id from a fingerprint, handy for logging/dedupe sets. */
export function fingerprintHash(a: Activity | ActivityDraft): string {
  return hashSeed(fingerprint(a)).toString(36);
}
