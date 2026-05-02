import { cors } from 'hono/cors';
import type { MiddlewareHandler } from 'hono';
import type { ApiEnv } from '@maki/config';

/**
 * Environment-scoped CORS. Production excludes any localhost origin.
 * Lesson from Civion Safe: hardcoded localhost in prod CORS allowlist
 * lets any local script call the production API.
 */
export function corsMiddleware(env: ApiEnv): MiddlewareHandler {
  const origins = env.CORS_ORIGINS.filter((o) => {
    if (env.APP_ENV !== 'production') return true;
    return !/^https?:\/\/localhost(:\d+)?$/i.test(o);
  });

  return cors({
    origin: origins.length > 0 ? origins : (origin) => origin ?? '*',
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
    exposeHeaders: ['X-RateLimit-Remaining', 'X-RateLimit-Reset'],
    maxAge: 600,
  });
}
