import { describe, expect, it } from 'vitest';
import { ApiEnvSchema, WebEnvSchema, parseEnv } from './env.js';

const baseApiEnv = {
  DATABASE_URL: 'postgres://user:pass@localhost:5432/maki',
  REDIS_URL: 'redis://localhost:6379',
  JWT_PRIVATE_KEY: 'a'.repeat(32),
  JWT_PUBLIC_KEY: 'b'.repeat(32),
};

describe('ApiEnvSchema', () => {
  it('parses with only required vars — optional vendor keys absent, incl. SENTRY_DSN', () => {
    const env = parseEnv(ApiEnvSchema, baseApiEnv);
    expect(env.SENTRY_DSN).toBeUndefined();
    expect(env.BREVO_API_KEY).toBeUndefined();
    expect(env.APP_ENV).toBe('local');
  });

  it('accepts a valid SENTRY_DSN and BREVO_API_KEY when set', () => {
    const env = parseEnv(ApiEnvSchema, {
      ...baseApiEnv,
      SENTRY_DSN: 'https://public@o0.ingest.sentry.io/0',
      BREVO_API_KEY: 'xkeysib-test',
    });
    expect(env.SENTRY_DSN).toBe('https://public@o0.ingest.sentry.io/0');
    expect(env.BREVO_API_KEY).toBe('xkeysib-test');
  });

  it('rejects a malformed SENTRY_DSN', () => {
    const parsed = ApiEnvSchema.safeParse({ ...baseApiEnv, SENTRY_DSN: 'not-a-url' });
    expect(parsed.success).toBe(false);
  });

  it('no longer recognizes the retired Postmark/Twilio names as schema fields', () => {
    expect('POSTMARK_SERVER_TOKEN' in ApiEnvSchema.shape).toBe(false);
    expect('TWILIO_ACCOUNT_SID' in ApiEnvSchema.shape).toBe(false);
    expect('TWILIO_AUTH_TOKEN' in ApiEnvSchema.shape).toBe(false);
  });
});

describe('WebEnvSchema', () => {
  const baseWebEnv = { NEXT_PUBLIC_API_URL: 'http://localhost:3001' };

  it('parses with only the required API URL — every observability var optional', () => {
    const env = parseEnv(WebEnvSchema, baseWebEnv);
    expect(env.NEXT_PUBLIC_SITE_URL).toBeUndefined();
    expect(env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN).toBeUndefined();
    expect(env.NEXT_PUBLIC_SENTRY_DSN).toBeUndefined();
  });

  it('accepts all vars when set', () => {
    const env = parseEnv(WebEnvSchema, {
      ...baseWebEnv,
      NEXT_PUBLIC_SITE_URL: 'https://makitulum.com',
      NEXT_PUBLIC_PLAUSIBLE_DOMAIN: 'makitulum.com',
      NEXT_PUBLIC_SENTRY_DSN: 'https://public@o0.ingest.sentry.io/1',
    });
    expect(env.NEXT_PUBLIC_SITE_URL).toBe('https://makitulum.com');
    expect(env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN).toBe('makitulum.com');
  });
});
