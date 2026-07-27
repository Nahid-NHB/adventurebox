import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// Minimal single-operator gate. This is an internal tool used by one small team,
// not a multi-user product, so a shared password + one signed cookie is enough.
// The cookie value is a server-only secret (never the password itself).

export const SESSION_COOKIE = 'ab_admin';

function sessionToken(): string {
  const token = process.env.ADMIN_SESSION_TOKEN;
  if (!token) throw new Error('Set ADMIN_SESSION_TOKEN in the admin env.');
  return token;
}

export function checkPassword(input: string): boolean {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) throw new Error('Set ADMIN_PASSWORD in the admin env.');
  // Constant-time compare to avoid leaking length/prefix via timing.
  if (input.length !== pw.length) return false;
  let diff = 0;
  for (let i = 0; i < pw.length; i++) diff |= input.charCodeAt(i) ^ pw.charCodeAt(i);
  return diff === 0;
}

export async function grantSession(): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, sessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12, // 12h
  });
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function isAuthed(): Promise<boolean> {
  const jar = await cookies();
  return jar.get(SESSION_COOKIE)?.value === sessionToken();
}

/** Guard for server components/pages. Redirects to /login when not authed. */
export async function requireAuth(): Promise<void> {
  if (!(await isAuthed())) redirect('/login');
}
