import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { buildTestEnv } from './env.js';

const noopHealth = { pingDb: null, pingRedis: null };

describe('CORS', () => {
  it('reflects an allow-listed origin', async () => {
    const app = createApp(
      buildTestEnv({ APP_ENV: 'local', CORS_ORIGINS: ['http://localhost:3000'] }),
      { health: noopHealth },
    );

    const res = await app.request('/healthz', { headers: { origin: 'http://localhost:3000' } });

    expect(res.headers.get('access-control-allow-origin')).toBe('http://localhost:3000');
  });

  it('does not reflect an origin outside the allowlist', async () => {
    const app = createApp(
      buildTestEnv({ APP_ENV: 'local', CORS_ORIGINS: ['http://localhost:3000'] }),
      { health: noopHealth },
    );

    const res = await app.request('/healthz', { headers: { origin: 'https://evil.example.test' } });

    expect(res.headers.get('access-control-allow-origin')).toBeNull();
  });

  it('strips localhost origins from the allowlist in production', async () => {
    const app = createApp(
      buildTestEnv({
        APP_ENV: 'production',
        CORS_ORIGINS: ['http://localhost:3000', 'https://app.makitulum.com'],
      }),
      { health: noopHealth },
    );

    const localhostRes = await app.request('/healthz', {
      headers: { origin: 'http://localhost:3000' },
    });
    expect(localhostRes.headers.get('access-control-allow-origin')).toBeNull();

    const prodRes = await app.request('/healthz', {
      headers: { origin: 'https://app.makitulum.com' },
    });
    expect(prodRes.headers.get('access-control-allow-origin')).toBe('https://app.makitulum.com');
  });
});
