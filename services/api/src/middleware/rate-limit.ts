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
  // Gated on APP_ENV too: NODE_ENV is independently settable at runtime, so
  // NODE_ENV=test alone would silently disable the limiter on a deployed service.
  if (!store && env.NODE_ENV === 'test' && env.APP_ENV === 'local') {
    return (_c, next) => next();
  }
  const backing = store ?? redisStore(env);

  return async (c, next) => {
    const ip = clientIp(c.req.header('x-forwarded-for'));
    const path = new URL(c.req.url).pathname;
    const limit = limitForPath(path);
    const key = `${env.RATE_LIMIT_REDIS_PREFIX}:${path}:${ip}`;

    let overLimit = false;
    try {
      const count = await backing.incr(key);
      if (count === 1) await backing.expire(key, limit.windowSeconds);

      const remaining = Math.max(0, limit.requests - count);
      c.res.headers.set('X-RateLimit-Remaining', String(remaining));

      // Decided before any further store call. Reading the TTL inside the same
      // try meant a Redis drop between incr and ttl fell through to the
      // fail-open catch and served a request already known to be over limit.
      overLimit = count > limit.requests;
      if (overLimit) {
        try {
          c.res.headers.set('X-RateLimit-Reset', String(await backing.ttl(key)));
        } catch {
          // Header is advisory; its absence must not un-block the 429.
        }
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
    } catch (err) {
      if (overLimit) throw err;
      // Fail-open on Redis hiccups for ordinary traffic — better to serve than
      // to 500. Auth endpoints fail CLOSED: an unobserved Redis outage would
      // otherwise hand an attacker an unthrottled brute-force window, which is
      // the exact thing rate limiting exists to prevent.
      console.error('[rate-limit] backing store unavailable', err);
      if (limit.failClosed) {
        return c.json(
          {
            error: {
              code: 'rate_limit_unavailable',
              message: 'Rate limiting is temporarily unavailable, please retry shortly',
            },
          },
          503,
        );
      }
    }

    return next();
  };
}

/**
 * Proxies APPEND the real peer address to X-Forwarded-For, so the leftmost
 * entry is whatever the client wrote. Keying on it lets an attacker mint a new
 * bucket per request with a header and defeat the limiter entirely.
 */
export function clientIp(header: string | undefined): string {
  const hops = (header ?? '')
    .split(',')
    .map((h) => h.trim())
    .filter(Boolean);
  return hops.at(-1) ?? 'unknown';
}

function limitForPath(path: string): {
  requests: number;
  windowSeconds: number;
  failClosed: boolean;
} {
  if (path.endsWith('/auth/login')) return RATE_LIMITS.login;
  if (path.endsWith('/auth/register')) return RATE_LIMITS.register;
  if (path.endsWith('/auth/forgot-password')) return RATE_LIMITS.forgotPassword;
  if (path.endsWith('/auth/reset-password')) return RATE_LIMITS.resetPassword;
  return RATE_LIMITS.default;
}
