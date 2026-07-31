import { cors } from 'hono/cors';
import type { MiddlewareHandler } from 'hono';
import type { ApiEnv } from '@maki/config';

// Covers every loopback spelling, not just the literal hostname — an allowlist
// of http://127.0.0.1:3000 would otherwise survive the production filter.
const LOOPBACK = /^https?:\/\/(localhost|127(\.\d{1,3}){3}|\[::1\]|0\.0\.0\.0)(:\d+)?$/i;

/**
 * Environment-scoped CORS. Production excludes any loopback origin.
 * Lesson from Civion Safe: hardcoded localhost in prod CORS allowlist
 * lets any local script call the production API.
 */
export function corsMiddleware(env: ApiEnv): MiddlewareHandler {
  const origins = env.CORS_ORIGINS.filter((o) => {
    if (env.APP_ENV !== 'production') return true;
    return !LOOPBACK.test(o);
  });

  // Fail closed. CORS_ORIGINS defaults to empty, and the production filter above
  // can empty a localhost-only allowlist — so the previous reflect-the-caller
  // fallback turned a one-line misconfiguration into allow-any-origin while
  // credentials are enabled. Refusing to boot is the safe direction.
  if (origins.length === 0 && env.APP_ENV !== 'local') {
    throw new Error(
      `CORS_ORIGINS is empty for APP_ENV=${env.APP_ENV}. Set at least one non-loopback origin.`,
    );
  }

  return cors({
    origin: origins,
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
    exposeHeaders: ['X-RateLimit-Remaining', 'X-RateLimit-Reset'],
    maxAge: 600,
  });
}
