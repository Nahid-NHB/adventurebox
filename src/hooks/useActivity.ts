import { useQuery } from '@tanstack/react-query';
import { activitiesRepo } from '@/database';
import { qk } from '@/api/queryKeys';

export function useActivity(id: string | undefined) {
  return useQuery({
    enabled: Boolean(id),
    queryKey: qk.activity(id ?? 'none'),
    queryFn: () => (id ? activitiesRepo.getActivityById(id) : null),
  });
}
