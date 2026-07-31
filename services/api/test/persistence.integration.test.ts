import { randomUUID } from 'node:crypto';
import { Redis } from 'ioredis';
import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { redisStore } from '../src/middleware/rate-limit.js';
import type { HealthDeps } from '../src/routes/health.js';
import {
  startTestPostgres,
  startTestRedis,
  type TestPostgres,
  type TestRedis,
} from './containers.js';
import { buildTestEnv } from './env.js';

// One Postgres + one Redis container for this whole suite (not per test) —
// container startup dominates wall-clock time otherwise.
let pg: TestPostgres;
let redis: TestRedis;

beforeAll(async () => {
  [pg, redis] = await Promise.all([startTestPostgres(), startTestRedis()]);
}, 120_000);

afterAll(async () => {
  await Promise.all([pg.stop(), redis.stop()]);
});

describe('/readyz against real Postgres + Redis', () => {
  it('reports checks.db/checks.redis ok and 200 when both are actually reachable', async () => {
    const pool = new Pool({ connectionString: pg.connectionUri, max: 1 });
    const client = new Redis(redis.connectionUrl, { lazyConnect: true });

    const health: HealthDeps = {
      pingDb: async () => {
        await pool.query('select 1');
      },
      pingRedis: async () => {
        await client.ping();
      },
    };

    const app = createApp(
      buildTestEnv({ DATABASE_URL: pg.connectionUri, REDIS_URL: redis.connectionUrl }),
      { health },
    );

    const res = await app.request('/readyz');

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ status: 'ok', checks: { db: 'ok', redis: 'ok' } });

    await pool.end();
    client.disconnect();
  });
});

describe('rate limiting against real Redis', () => {
  it('exceeds the reset-password limit (5/window) and returns 429 with rate-limit headers', async () => {
    const env = buildTestEnv({ REDIS_URL: redis.connectionUrl });
    const store = redisStore(env);
    const app = createApp(env, {
      rateLimitStore: store,
      health: { pingDb: null, pingRedis: null },
    });

    const responses = [];
    for (let i = 0; i < 6; i += 1) {
      responses.push(await app.request('/auth/reset-password', { method: 'POST' }));
    }

    const allowed = responses.slice(0, 5);
    const blocked = responses[5];
    if (!blocked) throw new Error('expected a 6th response');

    for (const res of allowed) {
      expect(res.status).not.toBe(429);
    }

    expect(blocked.status).toBe(429);
    expect(blocked.headers.get('X-RateLimit-Remaining')).toBe('0');
    expect(blocked.headers.get('X-RateLimit-Reset')).toEqual(expect.any(String));
    const body = await blocked.json();
    expect(body).toMatchObject({ error: { code: 'rate_limit_exceeded' } });
  });
});

describe('tenant isolation (ADR 0007/0008)', () => {
  // db/index.ts reads DATABASE_URL from process.env at module-load time, so it
  // must be pointed at the ephemeral container before this describe's first
  // dynamic import of it (directly or via a repository).
  let dbModule: typeof import('../src/db/index.js');
  let accountsRepo: typeof import('../src/db/repositories/accounts.js');
  let propertiesRepo: typeof import('../src/db/repositories/properties.js');

  beforeAll(async () => {
    process.env['DATABASE_URL'] = pg.connectionUri;
    dbModule = await import('../src/db/index.js');
    accountsRepo = await import('../src/db/repositories/accounts.js');
    propertiesRepo = await import('../src/db/repositories/properties.js');
  });

  afterAll(async () => {
    await dbModule.db.$client.end();
  });

  it("a repo call scoped to account A never returns account B's property", async () => {
    const suffix = randomUUID();
    const accountA = await accountsRepo.createAccount({ name: `Tenant Isolation A ${suffix}` });
    const accountB = await accountsRepo.createAccount({ name: `Tenant Isolation B ${suffix}` });

    const propertyA = await propertiesRepo.createProperty(accountA.id, {
      slug: `villa-a-${suffix}`,
      name: `Villa A ${suffix}`,
    });
    const propertyB = await propertiesRepo.createProperty(accountB.id, {
      slug: `villa-b-${suffix}`,
      name: `Villa B ${suffix}`,
    });

    expect(await propertiesRepo.findPropertyById(accountA.id, propertyB.id)).toBeNull();
    expect(await propertiesRepo.findPropertyById(accountB.id, propertyA.id)).toBeNull();

    const propertiesForA = await propertiesRepo.listProperties(accountA.id);
    expect(propertiesForA.map((p) => p.id)).toEqual([propertyA.id]);

    const found = await propertiesRepo.findPropertyById(accountA.id, propertyA.id);
    expect(found?.id).toBe(propertyA.id);
  });
});
