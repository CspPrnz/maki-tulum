import { fileURLToPath } from 'node:url';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { RedisContainer, type StartedRedisContainer } from '@testcontainers/redis';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

// Pinned to the same digests as infra/docker/docker-compose.yml so dev,
// integration tests, and prod all resolve to the same bytes.
const POSTGRES_IMAGE =
  'postgres:16-alpine@sha256:57c72fd2a128e416c7fcc499958864df5301e940bca0a56f58fddf30ffc07777';
const REDIS_IMAGE =
  'redis:7-alpine@sha256:e7723ff73d963f5cc6d9c4643ea3d989527a402a319239054e9472a7fb9219a2';

const migrationsFolder = fileURLToPath(new URL('../migrations', import.meta.url));

export type TestPostgres = {
  connectionUri: string;
  stop: () => Promise<void>;
};

/** Starts an ephemeral Postgres container and applies migrations/0001_init.sql via drizzle. */
export async function startTestPostgres(): Promise<TestPostgres> {
  const container: StartedPostgreSqlContainer = await new PostgreSqlContainer(POSTGRES_IMAGE)
    .withDatabase('maki_test')
    .withUsername('maki')
    .withPassword('maki')
    .start();

  const connectionUri = container.getConnectionUri();
  const migrationPool = new Pool({ connectionString: connectionUri });
  await migrate(drizzle(migrationPool), { migrationsFolder });
  await migrationPool.end();

  return {
    connectionUri,
    stop: () => container.stop(),
  };
}

export type TestRedis = {
  connectionUrl: string;
  stop: () => Promise<void>;
};

export async function startTestRedis(): Promise<TestRedis> {
  const container: StartedRedisContainer = await new RedisContainer(REDIS_IMAGE).start();
  return {
    connectionUrl: container.getConnectionUrl(),
    stop: () => container.stop(),
  };
}
