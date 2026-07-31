import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema.js';

// Fail loudly rather than let pg fall back to its own defaults. With no
// connection string pg connects to a database named after the OS user — which
// on a dev machine is a real, migrated database, so tests pass locally and fail
// only on CI. That exact false-green is how turbo's strict env mode went
// unnoticed: DATABASE_URL was being stripped before it reached vitest.
const connectionString = process.env['DATABASE_URL'];
if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. If this appears in a turbo task, add it to that task's passThroughEnv in turbo.json — turbo runs tasks in strict env mode and drops undeclared vars.",
  );
}

const pool = new Pool({ connectionString });

// pg re-emits idle-client errors on the pool, and an unhandled 'error' event
// terminates the process. Without this, a routine Postgres restart kills the
// API instead of degrading it — on Railway that is a restart loop, not an
// outage that heals. Queries surface their own errors; this only catches the
// idle-connection teardown.
pool.on('error', (err) => {
  console.error('[db] idle client error', err.message);
});

export const db = drizzle(pool, { schema });
