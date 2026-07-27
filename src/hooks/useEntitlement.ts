import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSubscriptionService } from '@/services/subscription';
import { qk } from '@/api/queryKeys';

export function useEntitlement() {
  return useQuery({
    queryKey: qk.entitlement(),
    queryFn: () => getSubscriptionService().getEntitlement(),
  });
}

/** Demo toggle for the stub subscription (locked <-> unlocked). */
export function useToggleEntitlement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => getSubscriptionService().__toggle(),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.entitlement() }),
  });
}
