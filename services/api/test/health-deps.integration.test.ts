import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { defaultHealthDeps } from '../src/routes/health.js';
import { createApp } from '../src/app.js';
import { buildTestEnv } from './env.js';
import { startTestPostgres, startTestRedis } from './containers.js';

/**
 * Every other readiness test injects fakes, so `defaultHealthDeps` — the wiring
 * production actually runs — had no coverage at all. That gap let a crash ship
 * green: the pool it builds had no 'error' listener, so a stopped Postgres
 * terminated the process instead of producing the 503 these tests assert.
 */
describe('defaultHealthDeps (production wiring)', () => {
  let pg: Awaited<ReturnType<typeof startTestPostgres>>;
  let redis: Awaited<ReturnType<typeof startTestRedis>>;

  beforeAll(async () => {
    pg = await startTestPostgres();
    redis = await startTestRedis();
  });

  afterAll(async () => {
    await pg.stop();
    await redis.stop();
  });

  it('reports both dependencies ok against real containers', async () => {
    const env = buildTestEnv({ DATABASE_URL: pg.connectionUri, REDIS_URL: redis.connectionUrl });
    const app = createApp(env, { health: defaultHealthDeps(env) });

    const res = await app.request('/readyz');
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ status: 'ok', checks: { db: 'ok', redis: 'ok' } });
  });

  it('reports 503 with db:fail against an unreachable Postgres, without killing the process', async () => {
    const env = buildTestEnv({
      // Reserved-for-documentation address; connections hang then time out
      // rather than being refused, which is the realistic outage shape.
      DATABASE_URL: 'postgres://maki:maki@192.0.2.1:5432/maki',
      REDIS_URL: redis.connectionUrl,
    });
    const app = createApp(env, { health: defaultHealthDeps(env) });

    const res = await app.request('/readyz');
    expect(res.status).toBe(503);
    expect(await res.json()).toMatchObject({ status: 'down', checks: { db: 'fail', redis: 'ok' } });

    // The assertion that matters: the probe reported a failure and we are still
    // running to observe it.
    expect(process.exitCode ?? 0).toBe(0);
  });
});
