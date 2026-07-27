/**
 * Real subscription via RevenueCat (react-native-purchases). Wraps App Store /
 * Play billing. A single "premium" entitlement unlocks unlimited AI and all
 * themed packs. Configured lazily from platform keys in config.
 */
import { Platform } from 'react-native';
import Purchases, { type CustomerInfo } from 'react-native-purchases';
import type { Entitlement, SubscriptionService } from './index';
import { ok, err, type Result } from '@/lib/result';
import { config } from '../config';

const ALL_PACKS = ['space', 'ocean', 'dinosaur', 'montessori', 'stem', 'travel', 'camping'];

function entitlementFrom(info: CustomerInfo): Entitlement {
  const active = Boolean(info.entitlements.active[config.revenueCat.entitlementId]);
  return active ? { tier: 'premium', packs: ALL_PACKS } : { tier: 'free', packs: [] };
}

export class RevenueCatSubscriptionService implements SubscriptionService {
  private configured = false;

  private ensureConfigured(): boolean {
    if (this.configured) return true;
    const apiKey = Platform.OS === 'ios' ? config.revenueCat.iosKey : config.revenueCat.androidKey;
    if (!apiKey) return false;
    Purchases.configure({ apiKey });
    this.configured = true;
    return true;
  }

  async getEntitlement(): Promise<Entitlement> {
    if (!this.ensureConfigured()) return { tier: 'free', packs: [] };
    try {
      const info = await Purchases.getCustomerInfo();
      return entitlementFrom(info);
    } catch {
      return { tier: 'free', packs: [] };
    }
  }

  async purchase(): Promise<Result<Entitlement>> {
    if (!this.ensureConfigured()) return err('unauthorized', 'Billing not configured.');
    try {
      const offerings = await Purchases.getOfferings();
      const pkg = offerings.current?.availablePackages?.[0];
      if (!pkg) return err('not_found', 'No subscription package available.');
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      return ok(entitlementFrom(customerInfo));
    } catch (e) {
      return err('unknown', 'Purchase failed or was cancelled.', e);
    }
  }

  async restore(): Promise<Result<Entitlement>> {
    if (!this.ensureConfigured()) return err('unauthorized', 'Billing not configured.');
    try {
      const info = await Purchases.restorePurchases();
      return ok(entitlementFrom(info));
    } catch (e) {
      return err('unknown', 'Restore failed.', e);
    }
  }

  async __toggle(): Promise<Entitlement> {
    // Not meaningful with real billing; just report current state.
    return this.getEntitlement();
  }
}
