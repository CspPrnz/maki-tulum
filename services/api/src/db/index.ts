import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema.js';

const pool = new Pool({
  connectionString: process.env['DATABASE_URL'],
});

// pg re-emits idle-client errors on the pool, and an unhandled 'error' event
// terminates the process. Without this, a routine Postgres restart kills the
// API instead of degrading it — on Railway that is a restart loop, not an
// outage that heals. Queries surface their own errors; this only catches the
// idle-connection teardown.
pool.on('error', (err) => {
  console.error('[db] idle client error', err.message);
});

export const db = drizzle(pool, { schema });
