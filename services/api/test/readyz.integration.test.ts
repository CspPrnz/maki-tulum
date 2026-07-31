import { describe, expect, it } from 'vitest';
import type { HealthDeps } from '../src/routes/health.js';
import { createApp } from '../src/app.js';
import { buildTestEnv } from './env.js';
import { assertMatchesSchema, schemaFor, type OpenApiDoc } from './openapi.js';

const ok = () => Promise.resolve();
const fail = () => Promise.reject(new Error('downstream unreachable'));

type Case = {
  name: string;
  health: HealthDeps;
  expectedStatus: 200 | 503;
  expectedBody: {
    status: 'ok' | 'down';
    db: 'ok' | 'fail' | 'skipped';
    redis: 'ok' | 'fail' | 'skipped';
  };
};

const cases: Case[] = [
  {
    name: 'both reachable',
    health: { pingDb: ok, pingRedis: ok },
    expectedStatus: 200,
    expectedBody: { status: 'ok', db: 'ok', redis: 'ok' },
  },
  {
    name: 'postgres down',
    health: { pingDb: fail, pingRedis: ok },
    expectedStatus: 503,
    expectedBody: { status: 'down', db: 'fail', redis: 'ok' },
  },
  {
    name: 'redis down',
    health: { pingDb: ok, pingRedis: fail },
    expectedStatus: 503,
    expectedBody: { status: 'down', db: 'ok', redis: 'fail' },
  },
  {
    name: 'both down',
    health: { pingDb: fail, pingRedis: fail },
    expectedStatus: 503,
    expectedBody: { status: 'down', db: 'fail', redis: 'fail' },
  },
  {
    name: 'both unconfigured (null deps report skipped, not fail)',
    health: { pingDb: null, pingRedis: null },
    expectedStatus: 200,
    expectedBody: { status: 'ok', db: 'skipped', redis: 'skipped' },
  },
];

describe('/readyz', () => {
  it.each(cases)('$name -> $expectedStatus', async ({ health, expectedStatus, expectedBody }) => {
    const app = createApp(buildTestEnv(), { health });

    const res = await app.request('/readyz');

    expect(res.status).toBe(expectedStatus);
    expect(res.headers.get('content-type')).toMatch(/application\/json/);
    const body = await res.json();
    expect(body).toMatchObject({
      status: expectedBody.status,
      checks: { db: expectedBody.db, redis: expectedBody.redis },
    });
  });

  it('200 and 503 bodies both match the schema served at /openapi.json', async () => {
    const app = createApp(buildTestEnv(), { health: { pingDb: ok, pingRedis: ok } });
    const specRes = await app.request('/openapi.json');
    const spec = (await specRes.json()) as OpenApiDoc;

    const okRes = await app.request('/readyz');
    const okBody: unknown = await okRes.json();
    expect(() => assertMatchesSchema(okBody, schemaFor(spec, '/readyz', 'get', 200))).not.toThrow();

    const downApp = createApp(buildTestEnv(), { health: { pingDb: fail, pingRedis: ok } });
    const downRes = await downApp.request('/readyz');
    expect(downRes.status).toBe(503);
    const downBody: unknown = await downRes.json();
    expect(() =>
      assertMatchesSchema(downBody, schemaFor(spec, '/readyz', 'get', 503)),
    ).not.toThrow();
  });
});
