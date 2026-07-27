/**
 * Real auth backed by Supabase. Parent-only (COPPA). Google/Apple use the OAuth
 * web flow via expo-web-browser (works without extra native config); email uses
 * a magic-link OTP. Session persistence is handled by the Supabase client.
 */
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import type { AuthService, AuthUser } from './index';
import { ok, err, type Result } from '@/lib/result';
import { getSupabase } from '../supabase';

WebBrowser.maybeCompleteAuthSession();

function mapUser(u: { id: string; email?: string | null; app_metadata?: { provider?: string } }): AuthUser {
  const provider = (u.app_metadata?.provider ?? 'email') as AuthUser['provider'];
  return { id: u.id, email: u.email ?? null, provider };
}

export class SupabaseAuthService implements AuthService {
  async getCurrentUser(): Promise<AuthUser | null> {
    const sb = getSupabase();
    if (!sb) return null;
    const { data } = await sb.auth.getUser();
    return data.user ? mapUser(data.user) : null;
  }

  private async oauth(provider: 'google' | 'apple'): Promise<Result<AuthUser>> {
    const sb = getSupabase();
    if (!sb) return err('unauthorized', 'Supabase is not configured.');

    const redirectTo = Linking.createURL('/auth-callback');
    const { data, error } = await sb.auth.signInWithOAuth({
      provider,
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error || !data.url) return err('unauthorized', error?.message ?? 'No auth URL.');

    const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (res.type !== 'success' || !res.url) return err('unauthorized', 'Sign-in cancelled.');

    // Exchange the returned code/tokens for a session.
    const url = new URL(res.url);
    const code = url.searchParams.get('code');
    if (code) {
      const { error: exErr } = await sb.auth.exchangeCodeForSession(code);
      if (exErr) return err('unauthorized', exErr.message);
    }
    const user = await this.getCurrentUser();
    return user ? ok(user) : err('unauthorized', 'No session after sign-in.');
  }

  signInWithGoogle() {
    return this.oauth('google');
  }
  signInWithApple() {
    return this.oauth('apple');
  }

  async signInWithEmail(email: string): Promise<Result<AuthUser>> {
    const sb = getSupabase();
    if (!sb) return err('unauthorized', 'Supabase is not configured.');
    const redirectTo = Linking.createURL('/auth-callback');
    const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
    if (error) return err('unauthorized', error.message);
    // The user completes sign-in via the emailed link; return a pending anon shape.
    return ok({ id: 'pending', email, provider: 'email' });
  }

  async signOut(): Promise<void> {
    await getSupabase()?.auth.signOut();
  }
}
