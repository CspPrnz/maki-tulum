import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { Redis } from 'ioredis';
import { Pool } from 'pg';
import { HealthResponseSchema, ReadyResponseSchema } from '@maki/types';

const SERVICE = 'maki-api';
const VERSION = process.env['npm_package_version'] ?? '0.0.1';

let pgPool: Pool | null = null;
let redis: Redis | null = null;

function getPool(): Pool {
  pgPool ??= new Pool({
    connectionString: process.env['DATABASE_URL'],
    connectionTimeoutMillis: 1000,
    max: 1,
  });
  return pgPool;
}

function getRedis(): Redis {
  redis ??= new Redis(process.env['REDIS_URL'] ?? 'redis://localhost:6379', {
    maxRetriesPerRequest: 1,
    lazyConnect: true,
  });
  return redis;
}

export const healthRoutes = new OpenAPIHono();

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

healthRoutes.openapi(healthRoute, (c) =>
  c.json({
    status: 'ok' as const,
    service: SERVICE,
    version: VERSION,
    timestamp: new Date().toISOString(),
  }),
);

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

healthRoutes.openapi(readyRoute, async (c) => {
  const checks: Record<string, 'ok' | 'fail' | 'skipped'> = {};

  try {
    if (process.env['DATABASE_URL']) {
      await getPool().query('select 1');
      checks['db'] = 'ok';
    } else {
      checks['db'] = 'skipped';
    }
  } catch {
    checks['db'] = 'fail';
  }

  try {
    const r = getRedis();
    await r.ping();
    checks['redis'] = 'ok';
  } catch {
    checks['redis'] = 'fail';
  }

  const failed = Object.values(checks).some((v) => v === 'fail');
  const status = failed ? ('down' as const) : ('ok' as const);

  return c.json(
    {
      status,
      service: SERVICE,
      checks,
      timestamp: new Date().toISOString(),
    },
    failed ? 503 : 200,
  );
});
