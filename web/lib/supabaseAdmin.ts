import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Service-role client. Bypasses RLS, so it must NEVER be imported into a client
// component. The `server-only` guard makes a client-side import a build error.
// Same credentials the moderation CLI (scripts/cms/moderate.ts) uses.

let cached: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the admin env.');
  }
  cached = createClient(url, key, { auth: { persistSession: false } });
  return cached;
}
