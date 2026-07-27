import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { favoritesRepo } from '@/database';
import { qk } from '@/api/queryKeys';
import { LOCAL_FAMILY_ID } from '@/services/config';

export function useFavorites() {
  return useQuery({
    queryKey: qk.favorites(LOCAL_FAMILY_ID),
    queryFn: () => favoritesRepo.getFavoriteIds(LOCAL_FAMILY_ID),
  });
}

export function useToggleFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (activityId: string) =>
      favoritesRepo.toggleFavorite(LOCAL_FAMILY_ID, activityId),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: qk.favorites(LOCAL_FAMILY_ID) }),
  });
}
