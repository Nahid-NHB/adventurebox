/**
 * Fast key-value store for hot flags (onboarded, active child, theme, cached
 * daily pick). Backed by AsyncStorage today; the interface is intentionally
 * tiny so react-native-mmkv can be dropped in later without touching callers.
 *
 * A synchronous in-memory cache mirror lets routing read `onboarded` without an
 * await on the very first frame (no onboarding flash).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const mem = new Map<string, string>();
let hydrated = false;

const KEYS = [
  'onboarded',
  'activeChildId',
  'theme',
  'entitlement',
  'notifyEnabled',
  'lastSyncedAt',
] as const;

/** Warm the in-memory mirror once at startup. */
export async function hydrateKv(): Promise<void> {
  if (hydrated) return;
  const pairs = await AsyncStorage.multiGet(KEYS as unknown as string[]);
  for (const [k, v] of pairs) if (v != null) mem.set(k, v);
  hydrated = true;
}

export const kv = {
  getString(key: string): string | undefined {
    return mem.get(key);
  },
  getBool(key: string): boolean {
    return mem.get(key) === 'true';
  },
  async set(key: string, value: string): Promise<void> {
    mem.set(key, value);
    await AsyncStorage.setItem(key, value);
  },
  async setBool(key: string, value: boolean): Promise<void> {
    await this.set(key, value ? 'true' : 'false');
  },
  async remove(key: string): Promise<void> {
    mem.delete(key);
    await AsyncStorage.removeItem(key);
  },
};
