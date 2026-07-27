/**
 * Safety gate for activities (curated OR AI-generated). Every activity passes
 * through this before it can be served to a child. It is intentionally
 * conservative and pure so it can be unit-tested exhaustively.
 */
import type { ActivityDraft, Material } from '@/types/domain';

export interface SafetyResult {
  safe: boolean;
  reasons: string[];
}

/** Materials that are choking/ingestion hazards for the youngest children. */
const CHOKING_RISK_MATERIALS: Material[] = ['balloons'];

/** Words that signal a hazard we never want in a young child's activity. */
const HAZARD_LEXICON = [
  'knife',
  'blade',
  'stove',
  'oven',
  'boiling',
  'boil',
  'flame',
  'fire',
  'match',
  'lighter',
  'bleach',
  'chemical',
  'electric',
  'outlet',
  'socket',
  'medication',
  'pill',
  'sharp',
  'hot glue',
  'candle',
  'scald',
];

/** Age below which un-supervised heat/sharp/small-parts risks are unacceptable. */
const YOUNG_AGE = 6;

function textOf(a: ActivityDraft): string {
  return [
    a.title,
    a.storyIntro,
    a.mission,
    a.objective,
    ...a.steps,
    ...a.reflectionQuestions,
  ]
    .join(' ')
    .toLowerCase();
}

/**
 * Check an activity for a given target age. Pass the youngest participating
 * child's age when running family activities.
 */
export function checkSafety(a: ActivityDraft, targetAge: number): SafetyResult {
  const reasons: string[] = [];
  const body = textOf(a);

  // 1. Age range must be coherent and include the target child.
  if (a.minAge > a.maxAge) {
    reasons.push('Age range is inverted (minAge > maxAge).');
  }
  if (targetAge < a.minAge || targetAge > a.maxAge) {
    reasons.push(`Activity age band ${a.minAge}-${a.maxAge} excludes child age ${targetAge}.`);
  }

  // 2. Time range coherent.
  if (a.minTime > a.maxTime) {
    reasons.push('Time range is inverted (minTime > maxTime).');
  }

  // 3. Hazard lexicon — always rejected for young children, and flagged if the
  //    activity claims no safety tips.
  const foundHazards = HAZARD_LEXICON.filter((w) => body.includes(w));
  if (foundHazards.length > 0) {
    if (targetAge < YOUNG_AGE) {
      reasons.push(`Hazardous content for age ${targetAge}: ${foundHazards.join(', ')}.`);
    } else if (a.safetyTips.length === 0) {
      reasons.push(`Contains risk words (${foundHazards.join(', ')}) but no safety tips.`);
    }
  }

  // 4. Choking-risk materials for the youngest.
  if (targetAge < 4) {
    const risky = a.materialsRequired.filter((m) => CHOKING_RISK_MATERIALS.includes(m));
    if (risky.length > 0) {
      reasons.push(`Choking-risk materials for age ${targetAge}: ${risky.join(', ')}.`);
    }
  }

  // 5. Must actually contain instructions.
  if (a.steps.length === 0) {
    reasons.push('Activity has no steps.');
  }

  return { safe: reasons.length === 0, reasons };
}

/**
 * Verify an activity only uses materials the family owns (plus always-available
 * household basics). Used by the AI pipeline so we never ask for things the
 * parent doesn't have.
 */
export function usesOnlyAvailableMaterials(
  a: ActivityDraft,
  available: Material[],
): boolean {
  return a.materialsRequired.every((m) => available.includes(m));
}
