import { describe, expect, it } from '@jest/globals';
import { CURATED_ACTIVITIES } from '../seed/activities';
import { ActivitySchema } from '@/types/domain';
import { checkSafety } from '@/lib/safety';
import { fingerprint } from '@/lib/fingerprint';

describe('curated library', () => {
  it('has a healthy number of activities', () => {
    expect(CURATED_ACTIVITIES.length).toBeGreaterThanOrEqual(20);
  });

  it('every activity matches the schema', () => {
    for (const a of CURATED_ACTIVITIES) {
      const parsed = ActivitySchema.safeParse(a);
      if (!parsed.success) {
        throw new Error(`${a.id} invalid: ${parsed.error.message}`);
      }
      expect(parsed.success).toBe(true);
    }
  });

  it('every activity passes the safety gate at its minimum age', () => {
    for (const a of CURATED_ACTIVITIES) {
      const r = checkSafety(a, a.minAge);
      if (!r.safe) throw new Error(`${a.id} unsafe: ${r.reasons.join('; ')}`);
      expect(r.safe).toBe(true);
    }
  });

  it('has unique ids and no duplicate fingerprints', () => {
    const ids = new Set(CURATED_ACTIVITIES.map((a) => a.id));
    expect(ids.size).toBe(CURATED_ACTIVITIES.length);
    const fps = new Set(CURATED_ACTIVITIES.map((a) => fingerprint(a)));
    expect(fps.size).toBe(CURATED_ACTIVITIES.length);
  });

  it('has at least one free (non-premium) activity per common age', () => {
    for (const age of [3, 5, 7, 9]) {
      const free = CURATED_ACTIVITIES.filter(
        (a) => !a.premiumPack && age >= a.minAge && age <= a.maxAge,
      );
      expect(free.length).toBeGreaterThan(0);
    }
  });
});
