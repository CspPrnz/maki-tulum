import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { buildTestEnv } from './env.js';
import { assertMatchesSchema, schemaFor, type OpenApiDoc } from './openapi.js';

describe('/healthz', () => {
  it('returns 200 with the documented body', async () => {
    const app = createApp(buildTestEnv(), { health: { pingDb: null, pingRedis: null } });

    const res = await app.request('/healthz');

    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toMatch(/application\/json/);
    const body = await res.json();
    expect(body).toMatchObject({
      status: 'ok',
      service: 'maki-api',
      version: expect.any(String),
      timestamp: expect.any(String),
    });
  });

  it('response matches the schema served at /openapi.json', async () => {
    const app = createApp(buildTestEnv(), { health: { pingDb: null, pingRedis: null } });

    const specRes = await app.request('/openapi.json');
    const spec = (await specRes.json()) as OpenApiDoc;
    const schema = schemaFor(spec, '/healthz', 'get', 200);

    const res = await app.request('/healthz');
    const body: unknown = await res.json();

    expect(() => assertMatchesSchema(body, schema)).not.toThrow();
  });
});
