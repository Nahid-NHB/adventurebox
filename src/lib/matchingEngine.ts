/**
 * Matching engine — pure, deterministic activity ranking. This is what makes
 * "open app -> personalized activity in <15s" possible: it runs synchronously
 * over the local SQLite library, no network, no AI on the hot path.
 *
 * Determinism: given the same candidates, context and seed, it always returns
 * the same ordering. "Today's Adventure" seeds on (date + childId) so it is
 * stable across launches; "Another" advances the seed offset.
 */
import type { Activity, GenContext, Difficulty } from '@/types/domain';
import { fingerprint } from './fingerprint';
import { seededRandom } from './rng';

export interface ScoredActivity {
  activity: Activity;
  score: number;
  breakdown: Record<string, number>;
}

const DIFFICULTY_RANK: Record<Difficulty, number> = { easy: 0, medium: 1, hard: 2 };

/** Map a rolling success rate to the difficulty we should aim for next. */
export function targetDifficulty(successRate: number): Difficulty {
  if (successRate >= 0.75) return 'hard';
  if (successRate >= 0.4) return 'medium';
  return 'easy';
}

function ageFit(a: Activity, age: number): number {
  if (age < a.minAge || age > a.maxAge) return 0;
  // Prefer activities whose band is centered near the child's age.
  const center = (a.minAge + a.maxAge) / 2;
  const span = Math.max(1, a.maxAge - a.minAge);
  return 1 - Math.min(1, Math.abs(age - center) / span);
}

function materialsFit(a: Activity, owned: GenContext['materials']): number {
  if (a.materialsRequired.length === 0) return 1; // no-material activities always fit
  const have = a.materialsRequired.filter((m) => owned.includes(m)).length;
  return have / a.materialsRequired.length;
}

function weatherFit(a: Activity, weather: GenContext['weather'], pref: GenContext['indoorOutdoorPref']): number {
  let score = 0.5;
  if (a.weatherTags.includes('any') || a.weatherTags.includes(weather)) score += 0.3;
  // Rain/cold should push indoor; sunny should allow outdoor.
  const wantsIndoor = weather === 'rainy' || weather === 'cold';
  if (wantsIndoor && a.indoorOutdoor === 'indoor') score += 0.2;
  if (!wantsIndoor && a.indoorOutdoor === 'outdoor') score += 0.1;
  if (pref !== 'either' && a.indoorOutdoor !== 'either' && a.indoorOutdoor !== pref) {
    score -= 0.3;
  }
  return Math.max(0, Math.min(1, score));
}

function timeFit(a: Activity, budget: number): number {
  if (budget >= a.minTime && budget <= a.maxTime) return 1;
  if (budget < a.minTime) return Math.max(0, budget / a.minTime); // too little time
  return 0.7; // has more time than needed — fine, mild penalty
}

function overlap<T>(a: readonly T[], b: readonly T[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const set = new Set(b);
  const hits = a.filter((x) => set.has(x)).length;
  return hits / a.length;
}

function difficultyFit(a: Activity, target: Difficulty): number {
  const diff = Math.abs(DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[target]);
  return 1 - diff / 2;
}

const WEIGHTS = {
  age: 3,
  materials: 2.5,
  weather: 1.5,
  time: 2,
  interests: 2,
  goals: 1.5,
  difficulty: 1.5,
  novelty: 2.5,
};

/** Score a single activity against the context. Higher is better. */
export function scoreActivity(a: Activity, ctx: GenContext): ScoredActivity {
  const recent = new Set(ctx.recentFingerprints);
  const isRecent = recent.has(fingerprint(a));

  const breakdown = {
    age: ageFit(a, ctx.child.age) * WEIGHTS.age,
    materials: materialsFit(a, ctx.materials) * WEIGHTS.materials,
    weather: weatherFit(a, ctx.weather, ctx.indoorOutdoorPref) * WEIGHTS.weather,
    time: timeFit(a, ctx.timeBudget) * WEIGHTS.time,
    interests: overlap(a.skills, ctx.child.interests as unknown as string[]) * WEIGHTS.interests,
    goals: overlap(a.skills, ctx.child.learningGoals) * WEIGHTS.goals,
    difficulty: difficultyFit(a, targetDifficulty(ctx.successRate)) * WEIGHTS.difficulty,
    novelty: (isRecent ? 0 : 1) * WEIGHTS.novelty,
  };

  const score = Object.values(breakdown).reduce((s, v) => s + v, 0);
  return { activity: a, score, breakdown };
}

/**
 * Rank all candidates. Hard filter: age band must include the child, and at
 * least half the required materials must be owned (so we never suggest the
 * impossible). Ties and near-ties are broken deterministically by the seed so
 * the ordering is stable but varied day to day.
 */
export function rankActivities(
  activities: Activity[],
  ctx: GenContext,
  seed: string,
): ScoredActivity[] {
  const rand = seededRandom(seed);
  const eligible = activities.filter((a) => {
    const ageOk = ctx.child.age >= a.minAge && ctx.child.age <= a.maxAge;
    const matOk = materialsFit(a, ctx.materials) >= 0.5;
    return ageOk && matOk;
  });

  return eligible
    .map((a) => {
      const scored = scoreActivity(a, ctx);
      // Small deterministic jitter (<1 point) to vary near-ties per seed.
      const jitter = rand() * 0.9;
      return { ...scored, score: scored.score + jitter };
    })
    .sort((x, y) => y.score - x.score);
}

/**
 * Pick the activity for a given day/offset. offset 0 = "Today's Adventure",
 * increment for each "Another" tap. Wraps around the ranked list.
 */
export function pickActivity(
  activities: Activity[],
  ctx: GenContext,
  seed: string,
  offset = 0,
): Activity | null {
  const ranked = rankActivities(activities, ctx, seed);
  if (ranked.length === 0) return null;
  return ranked[offset % ranked.length].activity;
}
