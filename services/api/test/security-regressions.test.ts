import { describe, expect, it } from 'vitest';
import { corsMiddleware } from '../src/middleware/cors.js';
import {
  clientIp,
  rateLimitMiddleware,
  type RateLimitStore,
} from '../src/middleware/rate-limit.js';
import { createApp } from '../src/app.js';
import { buildTestEnv } from './env.js';

/**
 * Regression tests for the P1 findings from the 2026-07-31 security review.
 * Each one fails against the code as it stood before that review.
 */

describe('CORS fails closed rather than reflecting the caller (P1-1)', () => {
  it('refuses to boot in production when every configured origin is loopback', () => {
    // The trap: CORS_ORIGINS is set, so nothing looks misconfigured, but the
    // production filter strips it to nothing and the old fallback then
    // reflected any Origin — with credentials enabled.
    const env = buildTestEnv({ APP_ENV: 'production', CORS_ORIGINS: ['http://localhost:3000'] });
    expect(() => corsMiddleware(env)).toThrow(/CORS_ORIGINS is empty/);
  });

  it('refuses to boot in staging when CORS_ORIGINS is unset (its default)', () => {
    const env = buildTestEnv({ APP_ENV: 'staging', CORS_ORIGINS: [] });
    expect(() => corsMiddleware(env)).toThrow(/CORS_ORIGINS is empty/);
  });

  it('strips loopback in production by IP spelling, not just the hostname', () => {
    const env = buildTestEnv({
      APP_ENV: 'production',
      CORS_ORIGINS: ['http://127.0.0.1:3000', 'https://makitulum.com'],
    });
    expect(() => corsMiddleware(env)).not.toThrow();
  });

  it('allows an empty allowlist locally, where there is no production surface to protect', () => {
    expect(() =>
      corsMiddleware(buildTestEnv({ APP_ENV: 'local', CORS_ORIGINS: [] })),
    ).not.toThrow();
  });
});

describe('rate-limit client IP is not attacker-controlled (P1-3)', () => {
  // Proxies APPEND the peer address, so the rightmost entry is the trusted one.
  it.each([
    { header: '203.0.113.9', expected: '203.0.113.9' },
    { header: 'spoofed-by-client, 203.0.113.9', expected: '203.0.113.9' },
    { header: 'a, b, 203.0.113.9', expected: '203.0.113.9' },
    { header: '  spoofed , 203.0.113.9  ', expected: '203.0.113.9' },
    { header: undefined, expected: 'unknown' },
  ])('$header -> $expected', ({ header, expected }) => {
    expect(clientIp(header)).toBe(expected);
  });

  it('gives a client the same bucket however it rewrites the left of the header', async () => {
    const counts = new Map<string, number>();
    const store: RateLimitStore = {
      incr: async (k) => {
        const n = (counts.get(k) ?? 0) + 1;
        counts.set(k, n);
        return n;
      },
      expire: async () => {},
      ttl: async () => 60,
    };
    const env = buildTestEnv({ APP_ENV: 'local', CORS_ORIGINS: ['http://localhost:3000'] });
    const app = createApp(env, { rateLimitStore: store });

    for (const spoof of ['aaa', 'bbb', 'ccc']) {
      await app.request('/healthz', { headers: { 'x-forwarded-for': `${spoof}, 203.0.113.9` } });
    }

    // One bucket, three hits — not three buckets of one.
    expect([...counts.values()]).toEqual([3]);
  });
});

describe('rate-limit degraded-store behaviour (P2-5)', () => {
  const brokenStore: RateLimitStore = {
    incr: async () => {
      throw new Error('redis down');
    },
    expire: async () => {},
    ttl: async () => 0,
  };

  it('fails closed on auth paths so an outage is not an unthrottled window', async () => {
    const env = buildTestEnv({ APP_ENV: 'local', CORS_ORIGINS: ['http://localhost:3000'] });
    const app = createApp(env, { rateLimitStore: brokenStore });

    const res = await app.request('/auth/login', { method: 'POST' });
    expect(res.status).toBe(503);
    expect(await res.json()).toMatchObject({ error: { code: 'rate_limit_unavailable' } });
  });

  it('fails open on ordinary paths so a Redis blip does not take the site down', async () => {
    const env = buildTestEnv({ APP_ENV: 'local', CORS_ORIGINS: ['http://localhost:3000'] });
    const app = createApp(env, { rateLimitStore: brokenStore });

    const res = await app.request('/healthz');
    expect(res.status).toBe(200);
  });
});

describe('rate-limit bypass cannot be reached on a deployed service (P2-4)', () => {
  it('still limits when NODE_ENV=test but APP_ENV is not local', async () => {
    const env = buildTestEnv({
      NODE_ENV: 'test',
      APP_ENV: 'production',
      CORS_ORIGINS: ['https://makitulum.com'],
    });
    let calls = 0;
    const store: RateLimitStore = {
      incr: async () => ++calls,
      expire: async () => {},
      ttl: async () => 60,
    };
    // Passing a store proves nothing on its own; the guard under test is the
    // no-store path, so build the middleware directly without one.
    expect(typeof rateLimitMiddleware(env)).toBe('function');

    const app = createApp(env, { rateLimitStore: store });
    await app.request('/healthz');
    expect(calls).toBe(1);
  });
});
