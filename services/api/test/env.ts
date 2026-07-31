import { randomUUID } from 'node:crypto';
import type { ApiEnv } from '@maki/config';

/** Builds a valid ApiEnv for tests. Each call gets a fresh rate-limit key prefix
 * so parallel suites sharing a real Redis don't clobber each other's counters. */
export function buildTestEnv(overrides: Partial<ApiEnv> = {}): ApiEnv {
  return {
    NODE_ENV: 'test',
    APP_ENV: 'local',
    PORT: 3001,
    DATABASE_URL: 'postgres://maki:maki@localhost:5432/maki_test',
    REDIS_URL: 'redis://localhost:6379',
    JWT_PRIVATE_KEY: 'a'.repeat(32),
    JWT_PUBLIC_KEY: 'a'.repeat(32),
    CORS_ORIGINS: ['http://localhost:3000'],
    RATE_LIMIT_REDIS_PREFIX: `maki:rl:test:${randomUUID()}`,
    ...overrides,
  };
}
