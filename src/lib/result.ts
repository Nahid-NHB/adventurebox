/**
 * Result<T> — every service boundary returns one of these instead of throwing.
 * Keeps error handling explicit and testable across the async abstraction layer.
 */

export type AppErrorCode =
  | 'network'
  | 'validation'
  | 'not_found'
  | 'unauthorized'
  | 'rate_limited'
  | 'safety_rejected'
  | 'unknown';

export interface AppError {
  code: AppErrorCode;
  message: string;
  cause?: unknown;
}

export type Result<T, E = AppError> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export const ok = <T>(value: T): Result<T> => ({ ok: true, value });

export const err = (
  code: AppErrorCode,
  message: string,
  cause?: unknown,
): Result<never> => ({ ok: false, error: { code, message, cause } });

export function isOk<T, E>(r: Result<T, E>): r is { ok: true; value: T } {
  return r.ok;
}

/** Unwrap or throw — use only at UI edges where you want an error boundary. */
export function unwrap<T>(r: Result<T>): T {
  if (r.ok) return r.value;
  throw new Error(`[${r.error.code}] ${r.error.message}`);
}
