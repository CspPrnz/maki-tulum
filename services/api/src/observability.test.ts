import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ApiEnv } from '@maki/config';

const initMock = vi.fn();
const captureExceptionMock = vi.fn();

vi.mock('@sentry/node', () => ({
  init: initMock,
  captureException: captureExceptionMock,
}));

const baseEnv: ApiEnv = {
  NODE_ENV: 'test',
  APP_ENV: 'local',
  PORT: 3001,
  DATABASE_URL: 'postgres://user:pass@localhost:5432/maki',
  REDIS_URL: 'redis://localhost:6379',
  JWT_PRIVATE_KEY: 'a'.repeat(32),
  JWT_PUBLIC_KEY: 'b'.repeat(32),
  CORS_ORIGINS: [],
  RATE_LIMIT_REDIS_PREFIX: 'maki:rl',
};

describe('observability', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('is a silent no-op with no SENTRY_DSN: no init call, no network call, no crash', async () => {
    const { initObservability, captureError } = await import('./observability.js');
    expect(() => initObservability(baseEnv)).not.toThrow();
    expect(initMock).not.toHaveBeenCalled();
    expect(() => captureError(new Error('boom'))).not.toThrow();
    expect(captureExceptionMock).not.toHaveBeenCalled();
  });

  it('initializes Sentry when SENTRY_DSN is set and forwards errors afterward', async () => {
    const { initObservability, captureError } = await import('./observability.js');
    const env = { ...baseEnv, SENTRY_DSN: 'https://public@o0.ingest.sentry.io/1' };
    initObservability(env);
    expect(initMock).toHaveBeenCalledWith(
      expect.objectContaining({ dsn: env.SENTRY_DSN, environment: env.APP_ENV }),
    );
    const err = new Error('boom');
    captureError(err);
    expect(captureExceptionMock).toHaveBeenCalledWith(err);
  });

  it('does not forward errors captured before init is called', async () => {
    const { captureError } = await import('./observability.js');
    captureError(new Error('too early'));
    expect(captureExceptionMock).not.toHaveBeenCalled();
  });

  // Sentry attaches IPs and request context by default. Without this we would
  // be shipping guest personal data to a US processor with no lawful basis —
  // see docs/backlog/plans/consent-data-map.md.
  it('scrubs IP, user, cookies, headers and body before any event leaves the process', async () => {
    const { initObservability } = await import('./observability.js');
    initObservability({ ...baseEnv, SENTRY_DSN: 'https://public@o0.ingest.sentry.io/1' });

    const options = initMock.mock.calls[0]?.[0];
    expect(options.sendDefaultPii).toBe(false);

    const scrubbed = options.beforeSend({
      user: { ip_address: '203.0.113.7', email: 'guest@example.test' },
      request: {
        url: 'https://api.makitulum.com/bookings',
        cookies: { session: 'secret' },
        headers: { 'x-forwarded-for': '203.0.113.7', authorization: 'Bearer tok' },
        data: { card: '4242424242424242' },
      },
    });

    expect(scrubbed.user).toBeUndefined();
    expect(scrubbed.request.cookies).toBeUndefined();
    expect(scrubbed.request.headers).toBeUndefined();
    expect(scrubbed.request.data).toBeUndefined();
    expect(scrubbed.request.url).toBe('https://api.makitulum.com/bookings');
  });
});
