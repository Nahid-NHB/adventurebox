/**
 * Builds a GenContext from local data for a child. Shared by the matching hook
 * (to rank) and the AI pipeline (to generate), so both see the same signals.
 */
import type { Child, GenContext } from '@/types/domain';
import { activitiesRepo, assignmentsRepo, familyRepo } from '@/database';
import { fingerprint } from '@/lib/fingerprint';
import { getWeatherService } from '../weather';
import { LOCAL_FAMILY_ID } from '../config';

export async function buildGenContext(child: Child): Promise<GenContext> {
  const [settings, recentIds, successRate, weather, all] = await Promise.all([
    familyRepo.getSettings(LOCAL_FAMILY_ID),
    assignmentsRepo.getRecentActivityIds(child.id),
    assignmentsRepo.getSuccessRate(child.id),
    getWeatherService().current(),
    activitiesRepo.getAllActivities(),
  ]);

  const byId = new Map(all.map((a) => [a.id, a]));
  const recentFingerprints = recentIds
    .map((id) => byId.get(id))
    .filter((a): a is NonNullable<typeof a> => Boolean(a))
    .map((a) => fingerprint(a));

  return {
    child: {
      age: child.age,
      interests: child.interests,
      learningGoals: child.learningGoals,
      energyDefault: child.energyDefault,
    },
    materials: settings?.materials ?? [],
    environment: settings?.environment ?? 'apartment',
    timeBudget: settings?.defaultTimeMinutes ?? 20,
    weather,
    indoorOutdoorPref: settings?.indoorOutdoorPref ?? 'either',
    recentFingerprints,
    successRate,
  };
}
