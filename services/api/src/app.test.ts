import { describe, expect, it } from 'vitest';
import { createApp } from './app.js';
import type { ApiEnv } from '@maki/config';

const testEnv: ApiEnv = {
  NODE_ENV: 'test',
  APP_ENV: 'local',
  PORT: 3001,
  DATABASE_URL: 'postgres://maki:maki@localhost:5432/maki_test',
  REDIS_URL: 'redis://localhost:6379',
  JWT_PRIVATE_KEY: 'a'.repeat(32),
  JWT_PUBLIC_KEY: 'a'.repeat(32),
  CORS_ORIGINS: ['http://localhost:3000'],
  RATE_LIMIT_REDIS_PREFIX: 'maki:rl:test',
};

describe('createApp', () => {
  it('returns 200 on /healthz with the standard envelope shape', async () => {
    const app = createApp(testEnv);
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

  it('returns 404 with the JSON error envelope for unknown routes', async () => {
    const app = createApp(testEnv);
    const res = await app.request('/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.headers.get('content-type')).toMatch(/application\/json/);
    const body = await res.json();
    expect(body).toMatchObject({
      error: { code: 'not_found', message: expect.any(String) },
    });
  });

  it('serves the OpenAPI spec at /openapi.json', async () => {
    const app = createApp(testEnv);
    const res = await app.request('/openapi.json');
    expect(res.status).toBe(200);
    const body = (await res.json()) as { openapi: string; info: { title: string } };
    expect(body.openapi).toMatch(/^3\./);
    expect(body.info.title).toBe('Maki Tulum API');
  });
});
