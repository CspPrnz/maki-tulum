import type { MiddlewareHandler } from 'hono';
import { Redis } from 'ioredis';
import { type ApiEnv, RATE_LIMITS } from '@maki/config';

/**
 * The counter backing the limiter. Injectable so integration tests can exercise
 * the 429 path against a container or a fake — a blanket test-mode bypass means
 * the limiter itself is never actually tested.
 */
export type RateLimitStore = {
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<void>;
  ttl(key: string): Promise<number>;
};

export function redisStore(env: ApiEnv): RateLimitStore {
  let redis: Redis | null = null;
  const client = () =>
    (redis ??= new Redis(env.REDIS_URL, { maxRetriesPerRequest: 2, lazyConnect: true }));

  return {
    incr: (key) => client().incr(key),
    expire: async (key, seconds) => {
      await client().expire(key, seconds);
    },
    ttl: (key) => client().ttl(key),
  };
}

/**
 * Per-IP rate limiter. Day-one requirement on every auth endpoint.
 * Lesson from Civion Safe: zero rate limiting allowed brute-force from day one.
 *
 * Returns JSON with explicit Content-Type — never plain text. Civion learned
 * that http.Error()-style responses break frontend JSON parsers.
 *
 * With no store injected the limiter is skipped under NODE_ENV=test, so ordinary
 * suites don't 429 themselves. Passing a store opts that suite back in.
 */
export function rateLimitMiddleware(env: ApiEnv, store?: RateLimitStore): MiddlewareHandler {
  if (!store && env.NODE_ENV === 'test') return (_c, next) => next();
  const backing = store ?? redisStore(env);

  return async (c, next) => {
    const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const path = new URL(c.req.url).pathname;
    const limit = limitForPath(path);
    const key = `${env.RATE_LIMIT_REDIS_PREFIX}:${path}:${ip}`;

    try {
      const count = await backing.incr(key);
      if (count === 1) await backing.expire(key, limit.windowSeconds);

      const remaining = Math.max(0, limit.requests - count);
      c.res.headers.set('X-RateLimit-Remaining', String(remaining));

      if (count > limit.requests) {
        c.res.headers.set('X-RateLimit-Reset', String(await backing.ttl(key)));
        return c.json(
          {
            error: {
              code: 'rate_limit_exceeded',
              message: 'Too many requests',
            },
          },
          429,
        );
      }
    } catch {
      // Fail-open on Redis hiccups — better to serve than to 500.
    }

    return next();
  };
}

function limitForPath(path: string): { requests: number; windowSeconds: number } {
  if (path.endsWith('/auth/login')) return RATE_LIMITS.login;
  if (path.endsWith('/auth/register')) return RATE_LIMITS.register;
  if (path.endsWith('/auth/forgot-password')) return RATE_LIMITS.forgotPassword;
  if (path.endsWith('/auth/reset-password')) return RATE_LIMITS.resetPassword;
  return RATE_LIMITS.default;
}
