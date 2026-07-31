import { afterAll, describe, expect, it } from 'vitest';
import { Role } from '@maki/types';

process.env['DATABASE_URL'] ??= 'postgres://maki:maki@localhost:5432/maki';

const { sql } = await import('drizzle-orm');
const { db } = await import('./index.js');
const { membershipRoleEnum } = await import('./schema.js');

afterAll(async () => {
  await db.$client.end();
});

describe('membership_role enum', () => {
  // Role is the canonical enum (packages/types/src/index.ts) — schema.ts must
  // mirror it, never redefine it, so both drift checks compare against Role.
  it('matches the canonical Role enum in schema.ts', () => {
    expect([...membershipRoleEnum.enumValues].sort()).toEqual([...Role.options].sort());
  });

  it('matches the canonical Role enum in the applied database type', async () => {
    const result = await db.execute<{ value: string }>(
      sql`select unnest(enum_range(null::membership_role))::text as value`,
    );
    const dbValues = result.rows.map((row) => row.value).sort();
    expect(dbValues).toEqual([...Role.options].sort());
  });
});
