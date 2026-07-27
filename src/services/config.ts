/**
 * Runtime config. Everything defaults to STUB so the app runs end-to-end with
 * zero credentials. Flip the EXPO_PUBLIC_USE_REAL_* flags to wire real backends.
 */
const flag = (v: string | undefined) => v === 'true' || v === '1';

export const config = {
  useRealAI: flag(process.env.EXPO_PUBLIC_USE_REAL_AI),
  useRealAuth: flag(process.env.EXPO_PUBLIC_USE_REAL_AUTH),
  useRealSync: flag(process.env.EXPO_PUBLIC_USE_REAL_SYNC),
  useRealSubscription: flag(process.env.EXPO_PUBLIC_USE_REAL_SUBSCRIPTION),
  ai: {
    proxyUrl: process.env.EXPO_PUBLIC_AI_PROXY_URL ?? '',
    model: process.env.EXPO_PUBLIC_AI_MODEL ?? 'anthropic/claude-3.5-haiku',
  },
  supabase: {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  },
  revenueCat: {
    iosKey: process.env.EXPO_PUBLIC_RC_IOS_KEY ?? '',
    androidKey: process.env.EXPO_PUBLIC_RC_ANDROID_KEY ?? '',
    entitlementId: process.env.EXPO_PUBLIC_RC_ENTITLEMENT ?? 'premium',
  },
} as const;

/** Single family id for the MVP (one household per install, no cloud yet). */
export const LOCAL_FAMILY_ID = 'local-family';
