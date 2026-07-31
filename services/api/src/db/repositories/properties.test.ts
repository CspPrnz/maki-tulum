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
const { accounts, properties } = await import('../schema.js');
const { createProperty, findPropertyById, findPropertyBySlug, listProperties } =
  await import('./properties.js');

const createdAccountIds: string[] = [];

async function makeAccount() {
  const [account] = await db
    .insert(accounts)
    .values({ name: `Test Account ${randomUUID()}` })
    .returning();
  if (!account) throw new Error('fixture: account insert returned no row');
  createdAccountIds.push(account.id);
  return account;
}

afterEach(async () => {
  while (createdAccountIds.length > 0) {
    const id = createdAccountIds.pop();
    if (id) {
      await db.delete(properties).where(eq(properties.accountId, id));
      await db.delete(accounts).where(eq(accounts.id, id));
    }
  }
});

afterAll(async () => {
  await db.$client.end();
});

describe('properties repository', () => {
  it('creates a property scoped to an account and finds it by id and slug', async () => {
    const account = await makeAccount();
    const slug = `villa-${randomUUID()}`;
    const created = await createProperty(account.id, { slug, name: 'Villa Test' });

    expect(created.accountId).toBe(account.id);

    const byId = await findPropertyById(account.id, created.id);
    expect(byId).toMatchObject({ id: created.id, slug });

    const bySlug = await findPropertyBySlug(account.id, slug);
    expect(bySlug).toMatchObject({ id: created.id, slug });
  });

  it('does not return a property when looked up under the wrong account', async () => {
    const accountA = await makeAccount();
    const accountB = await makeAccount();
    const created = await createProperty(accountA.id, {
      slug: `villa-${randomUUID()}`,
      name: 'Villa A',
    });

    expect(await findPropertyById(accountB.id, created.id)).toBeNull();
    expect(await findPropertyBySlug(accountB.id, created.slug)).toBeNull();
  });

  it('listProperties is tenant-isolated: account A never sees account B properties', async () => {
    const accountA = await makeAccount();
    const accountB = await makeAccount();
    const propA = await createProperty(accountA.id, {
      slug: `villa-${randomUUID()}`,
      name: 'Villa A',
    });
    await createProperty(accountB.id, { slug: `villa-${randomUUID()}`, name: 'Villa B' });

    const listA = await listProperties(accountA.id);
    expect(listA.map((p) => p.id)).toEqual([propA.id]);
  });
});
