import { randomUUID } from 'node:crypto';
import { afterAll, afterEach, describe, expect, it } from 'vitest';

// No fallback on purpose. Defaulting to a database name that happens to exist
// on a dev machine is what let turbo's strict env mode strip DATABASE_URL
// unnoticed: green locally, "database does not exist" on CI. Require it.
if (!process.env['DATABASE_URL']) {
  throw new Error('DATABASE_URL must be set to run these tests (see turbo.json passThroughEnv).');
}

const { eq } = await import('drizzle-orm');
const { db } = await import('../index.js');
const { accounts } = await import('../schema.js');
const { createAccount, findAccountById } = await import('./accounts.js');

const createdAccountIds: string[] = [];

afterEach(async () => {
  while (createdAccountIds.length > 0) {
    const id = createdAccountIds.pop();
    if (id) {
      await db.delete(accounts).where(eq(accounts.id, id));
    }
  }
});

afterAll(async () => {
  await db.$client.end();
});

describe('accounts repository', () => {
  it('creates an account and finds it by id', async () => {
    const name = `Test Account ${randomUUID()}`;
    const created = await createAccount({ name });
    createdAccountIds.push(created.id);

    expect(created.name).toBe(name);
    expect(created.id).toBeTruthy();

    const found = await findAccountById(created.id);
    expect(found).toMatchObject({ id: created.id, name });
  });

  it('returns null for a non-existent account id', async () => {
    const found = await findAccountById(randomUUID());
    expect(found).toBeNull();
  });
});
