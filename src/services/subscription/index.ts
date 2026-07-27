/**
 * Subscription abstraction (RevenueCat in production). Free tier = curated
 * library + limited weekly AI. Premium unlocks unlimited AI and themed packs.
 * The paywall gate reads a single entitlement flag. Default is a togglable stub
 * persisted in KV so you can demo locked -> unlocked without any store account.
 */
import type { Result } from '@/lib/result';
import { ok } from '@/lib/result';
import { kv } from '../kv';
import { config } from '../config';

export type Tier = 'free' | 'premium';

export interface Entitlement {
  tier: Tier;
  packs: string[]; // unlocked premium pack ids
}

const PREMIUM: Entitlement = {
  tier: 'premium',
  packs: ['space', 'ocean', 'dinosaur', 'montessori', 'stem', 'travel', 'camping'],
};
const FREE: Entitlement = { tier: 'free', packs: [] };

export interface SubscriptionService {
  getEntitlement(): Promise<Entitlement>;
  purchase(): Promise<Result<Entitlement>>;
  restore(): Promise<Result<Entitlement>>;
  /** Stub-only: toggle premium for demos. */
  __toggle(): Promise<Entitlement>;
}

class StubSubscriptionService implements SubscriptionService {
  async getEntitlement(): Promise<Entitlement> {
    return kv.getBool('entitlement') ? PREMIUM : FREE;
  }
  async purchase(): Promise<Result<Entitlement>> {
    await kv.setBool('entitlement', true);
    return ok(PREMIUM);
  }
  async restore(): Promise<Result<Entitlement>> {
    return ok(await this.getEntitlement());
  }
  async __toggle(): Promise<Entitlement> {
    const now = kv.getBool('entitlement');
    await kv.setBool('entitlement', !now);
    return now ? FREE : PREMIUM;
  }
}

let instance: SubscriptionService | null = null;
export function getSubscriptionService(): SubscriptionService {
  if (!instance) {
    if (config.useRealSubscription) {
      const { RevenueCatSubscriptionService } = require('./revenuecat');
      instance = new RevenueCatSubscriptionService();
    } else {
      instance = new StubSubscriptionService();
    }
  }
  return instance!;
}
