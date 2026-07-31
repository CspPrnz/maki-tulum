import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { buildTestEnv } from './env.js';

describe('JSON error envelope', () => {
  it('unknown route returns 404 with { error: { code, message } } and explicit JSON content type', async () => {
    const app = createApp(buildTestEnv(), { health: { pingDb: null, pingRedis: null } });

    const res = await app.request('/this-route-does-not-exist');

    expect(res.status).toBe(404);
    expect(res.headers.get('content-type')).toMatch(/^application\/json/);
    const body = await res.json();
    expect(body).toEqual({
      error: { code: 'not_found', message: expect.any(String) },
    });
  });
});
