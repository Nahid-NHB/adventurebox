/**
 * The core hook behind "open app -> personalized activity in <15s". It builds a
 * GenContext from local data (child, settings, weather, history) and runs the
 * pure matching engine synchronously over the cached SQLite library. No network
 * on this path. "Another" advances a per-child offset.
 */
import { useQuery } from '@tanstack/react-query';
import type { Child } from '@/types/domain';
import { activitiesRepo } from '@/database';
import { pickActivity } from '@/lib/matchingEngine';
import { todayKey } from '@/lib/date';
import { buildGenContext } from '@/services/ai/context';
import { qk } from '@/api/queryKeys';
import { useSessionStore } from '@/store/session';

export function useTodaysAdventure(child: Child | null) {
  const offset = useSessionStore((s) => s.pickOffset);

  return useQuery({
    enabled: Boolean(child),
    queryKey: qk.todaysAdventure(child?.id ?? 'none', offset),
    queryFn: async () => {
      if (!child) return null;
      const [ctx, activities] = await Promise.all([
        buildGenContext(child),
        activitiesRepo.getAllActivities(),
      ]);
      const seed = `${todayKey()}:${child.id}`;
      return pickActivity(activities, ctx, seed, offset);
    },
  });
}
