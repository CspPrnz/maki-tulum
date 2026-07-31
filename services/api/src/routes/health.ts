import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { Redis } from 'ioredis';
import { Pool } from 'pg';
import type { ApiEnv } from '@maki/config';
import { HealthResponseSchema, ReadyResponseSchema } from '@maki/types';

const SERVICE = 'maki-api';
const VERSION = process.env['npm_package_version'] ?? '0.0.1';

/**
 * Readiness probes are injectable so integration tests can point them at an
 * ephemeral container — and can simulate a downstream outage without stopping
 * the real one. `null` means "not configured": reported as `skipped`, not `fail`.
 */
export type HealthDeps = {
  pingDb: (() => Promise<void>) | null;
  pingRedis: (() => Promise<void>) | null;
};

export function defaultHealthDeps(env: ApiEnv): HealthDeps {
  let pool: Pool | null = null;
  let redis: Redis | null = null;

  return {
    pingDb: env.DATABASE_URL
      ? async () => {
          if (!pool) {
            pool = new Pool({
              connectionString: env.DATABASE_URL,
              connectionTimeoutMillis: 1000,
              max: 1,
            });
            // An unhandled 'error' event on the pool exits the process, so a
            // stopped Postgres would kill the API rather than let /readyz
            // report 503 — the readiness probe taking down the thing it
            // reports on. Same reason as the handler in db/index.ts.
            pool.on('error', (err) => {
              console.error('[readyz] idle db client error', err.message);
            });
          }
          await pool.query('select 1');
        }
      : null,
    pingRedis: env.REDIS_URL
      ? async () => {
          if (!redis) {
            redis = new Redis(env.REDIS_URL, {
              maxRetriesPerRequest: 1,
              lazyConnect: true,
            });
            // ioredis emits 'error' on connection loss; unhandled it is fatal.
            redis.on('error', (err) => {
              console.error('[readyz] redis client error', err.message);
            });
          }
          await redis.ping();
        }
      : null,
  };
}

const healthRoute = createRoute({
  method: 'get',
  path: '/healthz',
  summary: 'Liveness probe',
  description: 'Returns 200 if the process is up. Used by Railway healthcheck.',
  responses: {
    200: {
      content: { 'application/json': { schema: HealthResponseSchema } },
      description: 'Service is up',
    },
  },
});

const readyRoute = createRoute({
  method: 'get',
  path: '/readyz',
  summary: 'Readiness probe',
  description: 'Verifies downstream dependencies (DB, Redis) are reachable.',
  responses: {
    200: {
      content: { 'application/json': { schema: ReadyResponseSchema } },
      description: 'Service is ready',
    },
    503: {
      content: { 'application/json': { schema: ReadyResponseSchema } },
      description: 'Service is degraded or down',
    },
  },
});

async function check(ping: (() => Promise<void>) | null): Promise<'ok' | 'fail' | 'skipped'> {
  if (!ping) return 'skipped';
  try {
    await ping();
    return 'ok';
  } catch {
    return 'fail';
  }
}

export function healthRoutes(deps: HealthDeps) {
  const routes = new OpenAPIHono();

  routes.openapi(healthRoute, (c) =>
    c.json({
      status: 'ok' as const,
      service: SERVICE,
      version: VERSION,
      timestamp: new Date().toISOString(),
    }),
  );

  routes.openapi(readyRoute, async (c) => {
    const checks: Record<string, 'ok' | 'fail' | 'skipped'> = {
      db: await check(deps.pingDb),
      redis: await check(deps.pingRedis),
    };

    const failed = Object.values(checks).some((v) => v === 'fail');

    return c.json(
      {
        status: failed ? ('down' as const) : ('ok' as const),
        service: SERVICE,
        checks,
        timestamp: new Date().toISOString(),
      },
      failed ? 503 : 200,
    );
  });

  return routes;
}
