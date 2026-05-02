import type { MiddlewareHandler } from 'hono';
import { Redis } from 'ioredis';
import { type ApiEnv, RATE_LIMITS } from '@maki/config';

let redis: Redis | null = null;

function getRedis(env: ApiEnv): Redis {
  if (!redis) {
    redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 2,
      lazyConnect: true,
    });
  }
  return redis;
}

/**
 * Per-IP rate limiter. Day-one requirement on every auth endpoint.
 * Lesson from Civion Safe: zero rate limiting allowed brute-force from day one.
 *
 * Returns JSON with explicit Content-Type — never plain text. Civion learned
 * that http.Error()-style responses break frontend JSON parsers.
 */
export function rateLimitMiddleware(env: ApiEnv): MiddlewareHandler {
  return async (c, next) => {
    // Skip rate limiting in test mode (avoids self-429 from rapid test traffic).
    if (env.NODE_ENV === 'test') return next();

    const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const path = new URL(c.req.url).pathname;
    const limit = limitForPath(path);
    const key = `${env.RATE_LIMIT_REDIS_PREFIX}:${path}:${ip}`;

    try {
      const r = getRedis(env);
      const count = await r.incr(key);
      if (count === 1) await r.expire(key, limit.windowSeconds);

      const remaining = Math.max(0, limit.requests - count);
      c.res.headers.set('X-RateLimit-Remaining', String(remaining));

      if (count > limit.requests) {
        const ttl = await r.ttl(key);
        c.res.headers.set('X-RateLimit-Reset', String(ttl));
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
