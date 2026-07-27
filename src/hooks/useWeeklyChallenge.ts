import { useQuery } from '@tanstack/react-query';
import { weeklyChallengesRepo } from '@/database';
import { qk } from '@/api/queryKeys';
import { LOCAL_FAMILY_ID } from '@/services/config';

export function useWeeklyChallenge() {
  return useQuery({
    queryKey: qk.weeklyChallenge(LOCAL_FAMILY_ID),
    queryFn: () => weeklyChallengesRepo.getCurrentChallenge(LOCAL_FAMILY_ID),
  });
}
