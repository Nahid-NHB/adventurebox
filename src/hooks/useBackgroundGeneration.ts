/**
 * Fires the AI generation pipeline in the background, off the render path. It
 * never blocks the home screen: the curated library is always the fallback.
 * Throttled to once per child per day, and only when online with real AI
 * enabled. Failures are swallowed by the pipeline.
 */
import { useEffect } from 'react';
import * as Network from 'expo-network';
import { useQueryClient } from '@tanstack/react-query';
import type { Child } from '@/types/domain';
import { runGeneration } from '@/services/ai/pipeline';
import { buildGenContext } from '@/services/ai/context';
import { config } from '@/services/config';
import { kv } from '@/services/kv';
import { todayKey } from '@/lib/date';

export function useBackgroundGeneration(child: Child | null) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!child || !config.useRealAI) return;

    const throttleKey = `gen:${child.id}`;
    if (kv.getString(throttleKey) === todayKey()) return;

    let cancelled = false;
    (async () => {
      try {
        const net = await Network.getNetworkStateAsync();
        if (!net.isConnected) return;

        const ctx = await buildGenContext(child);
        const added = await runGeneration(ctx, 4);
        if (cancelled) return;

        await kv.set(throttleKey, todayKey());
        if (added > 0) {
          qc.invalidateQueries({ queryKey: ['activities'] });
          qc.invalidateQueries({ queryKey: ['todaysAdventure'] });
        }
      } catch {
        // Non-fatal: curated library covers the user.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [child, qc]);
}
