import { randomUUID } from 'node:crypto';
import { afterAll, afterEach, describe, expect, it } from 'vitest';

process.env['DATABASE_URL'] ??= 'postgres://maki:maki@localhost:5432/maki';

const { eq, inArray } = await import('drizzle-orm');
const { db } = await import('../index.js');
const { accountMemberships, accounts, users } = await import('../schema.js');
const {
  createUser,
  findUserByEmailUnscoped,
  findUserByIdUnscoped,
  findUserInAccount,
  listUsersForAccount,
} = await import('./users.js');

const createdUserIds: string[] = [];
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

async function addMembership(accountId: string, userId: string) {
  await db.insert(accountMemberships).values({ accountId, userId, role: 'guest' });
}

afterEach(async () => {
  if (createdAccountIds.length > 0) {
    await db
      .delete(accountMemberships)
      .where(inArray(accountMemberships.accountId, createdAccountIds));
  }
  while (createdUserIds.length > 0) {
    const id = createdUserIds.pop();
    if (id) await db.delete(users).where(eq(users.id, id));
  }
  while (createdAccountIds.length > 0) {
    const id = createdAccountIds.pop();
    if (id) await db.delete(accounts).where(eq(accounts.id, id));
  }
});

afterAll(async () => {
  await db.$client.end();
});

describe('users repository', () => {
  it('creates a user and finds it by id and email', async () => {
    const email = `test+${randomUUID()}@example.test`;
    const created = await createUser({ email, name: 'Test Guest' });
    createdUserIds.push(created.id);

    expect(created.email).toBe(email);

    const byId = await findUserByIdUnscoped(created.id);
    expect(byId).toMatchObject({ id: created.id, email });

    const byEmail = await findUserByEmailUnscoped(email);
    expect(byEmail).toMatchObject({ id: created.id, email });
  });

  it('returns null when looking up a non-existent user', async () => {
    expect(await findUserByIdUnscoped(randomUUID())).toBeNull();
    expect(await findUserByEmailUnscoped(`nobody+${randomUUID()}@example.test`)).toBeNull();
  });

  it('findUserInAccount only returns the user when a membership exists for that account', async () => {
    const account = await makeAccount();
    const otherAccount = await makeAccount();
    const email = `test+${randomUUID()}@example.test`;
    const user = await createUser({ email });
    createdUserIds.push(user.id);
    await addMembership(account.id, user.id);

    expect(await findUserInAccount(account.id, user.id)).toMatchObject({ id: user.id, email });
    expect(await findUserInAccount(otherAccount.id, user.id)).toBeNull();
  });

  it('listUsersForAccount is tenant-isolated: account A never sees account B members', async () => {
    const accountA = await makeAccount();
    const accountB = await makeAccount();

    const userA = await createUser({ email: `test+${randomUUID()}@example.test` });
    const userB = await createUser({ email: `test+${randomUUID()}@example.test` });
    createdUserIds.push(userA.id, userB.id);

    await addMembership(accountA.id, userA.id);
    await addMembership(accountB.id, userB.id);

    const membersOfA = await listUsersForAccount(accountA.id);
    expect(membersOfA.map((u) => u.id)).toEqual([userA.id]);
    expect(membersOfA.map((u) => u.id)).not.toContain(userB.id);

    const membersOfB = await listUsersForAccount(accountB.id);
    expect(membersOfB.map((u) => u.id)).toEqual([userB.id]);
  });
});
