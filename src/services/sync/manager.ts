/**
 * Connectivity-driven sync flush. Subscribes to network state and runs a full
 * sync when the device comes online (and once on startup if already online).
 * No-ops when sync is stubbed, so this is safe to always mount.
 */
import * as Network from 'expo-network';
import { getSyncService } from './index';
import { config } from '../config';

let started = false;
let flushing = false;

async function flush(): Promise<void> {
  if (flushing || !config.useRealSync) return;
  flushing = true;
  try {
    await getSyncService().fullSync();
  } catch {
    // Swallow: offline-first, we retry on the next connectivity event.
  } finally {
    flushing = false;
  }
}

export function startSyncManager(): () => void {
  if (started) return () => {};
  started = true;

  const sub = Network.addNetworkStateListener((state) => {
    if (state.isConnected && state.isInternetReachable !== false) {
      void flush();
    }
  });

  // Attempt an initial flush if we're already online.
  Network.getNetworkStateAsync()
    .then((s) => {
      if (s.isConnected) void flush();
    })
    .catch(() => {});

  return () => {
    sub.remove();
    started = false;
  };
}
