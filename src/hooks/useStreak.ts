import { useQuery } from '@tanstack/react-query';
import { streaksRepo } from '@/database';
import { qk } from '@/api/queryKeys';
import { LOCAL_FAMILY_ID } from '@/services/config';

export function useStreak() {
  return useQuery({
    queryKey: qk.streak(LOCAL_FAMILY_ID),
    queryFn: () => streaksRepo.getStreak(LOCAL_FAMILY_ID),
  });
}
