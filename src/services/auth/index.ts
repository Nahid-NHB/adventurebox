/**
 * Auth abstraction. Parent-only accounts (COPPA: no child login). Auth is
 * OPTIONAL to use the app — everything works locally; signing in only enables
 * cloud sync and subscription restore. Default is a local anonymous stub.
 */
import type { Result } from '@/lib/result';
import { ok } from '@/lib/result';
import { config } from '../config';
import { SupabaseAuthService } from './supabase';

export interface AuthUser {
  id: string;
  email: string | null;
  provider: 'anonymous' | 'google' | 'apple' | 'email';
}

export interface AuthService {
  getCurrentUser(): Promise<AuthUser | null>;
  signInWithGoogle(): Promise<Result<AuthUser>>;
  signInWithApple(): Promise<Result<AuthUser>>;
  signInWithEmail(email: string): Promise<Result<AuthUser>>;
  signOut(): Promise<void>;
}

const ANON: AuthUser = { id: 'local-anon', email: null, provider: 'anonymous' };

class StubAuthService implements AuthService {
  private user: AuthUser | null = ANON;
  async getCurrentUser() {
    return this.user;
  }
  async signInWithGoogle(): Promise<Result<AuthUser>> {
    this.user = { id: 'stub-google', email: 'parent@example.com', provider: 'google' };
    return ok(this.user);
  }
  async signInWithApple(): Promise<Result<AuthUser>> {
    this.user = { id: 'stub-apple', email: null, provider: 'apple' };
    return ok(this.user);
  }
  async signInWithEmail(email: string): Promise<Result<AuthUser>> {
    this.user = { id: 'stub-email', email, provider: 'email' };
    return ok(this.user);
  }
  async signOut() {
    this.user = ANON;
  }
}

let instance: AuthService | null = null;
export function getAuthService(): AuthService {
  if (!instance) {
    instance = config.useRealAuth ? new SupabaseAuthService() : new StubAuthService();
  }
  return instance;
}
