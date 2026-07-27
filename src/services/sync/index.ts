/**
 * Sync abstraction (Supabase in production). Offline-first: the app always
 * writes locally and appends to the outbox; this flushes when online. The stub
 * is a no-op that reports success, so the rest of the app behaves identically
 * whether or not a backend is configured.
 */
import type { Result } from '@/lib/result';
import { ok } from '@/lib/result';
import { config } from '../config';
import { SupabaseSyncService } from './supabase';

export interface SyncService {
  pushOutbox(): Promise<Result<{ pushed: number }>>;
  pullSince(sinceIso: string | null): Promise<Result<{ pulled: number }>>;
  fullSync(): Promise<Result<{ pushed: number; pulled: number }>>;
}

class StubSyncService implements SyncService {
  async pushOutbox(): Promise<Result<{ pushed: number }>> {
    return ok({ pushed: 0 });
  }
  async pullSince(): Promise<Result<{ pulled: number }>> {
    return ok({ pulled: 0 });
  }
  async fullSync(): Promise<Result<{ pushed: number; pulled: number }>> {
    return ok({ pushed: 0, pulled: 0 });
  }
}

let instance: SyncService | null = null;
export function getSyncService(): SyncService {
  if (!instance) {
    instance = config.useRealSync ? new SupabaseSyncService() : new StubSyncService();
  }
  return instance;
}
