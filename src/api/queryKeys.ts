/** Centralized React Query keys so invalidation stays consistent. */
export const qk = {
  children: (familyId: string) => ['children', familyId] as const,
  settings: (familyId: string) => ['settings', familyId] as const,
  activities: () => ['activities'] as const,
  activity: (id: string) => ['activity', id] as const,
  todaysAdventure: (childId: string, offset: number) =>
    ['todaysAdventure', childId, offset] as const,
  streak: (familyId: string) => ['streak', familyId] as const,
  favorites: (familyId: string) => ['favorites', familyId] as const,
  journal: (familyId: string) => ['journal', familyId] as const,
  weeklyChallenge: (familyId: string) => ['weeklyChallenge', familyId] as const,
  entitlement: () => ['entitlement'] as const,
};
