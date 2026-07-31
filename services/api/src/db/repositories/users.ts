import { and, eq } from 'drizzle-orm';
import { db } from '../index.js';
import { accountMemberships, users } from '../schema.js';
import type { NewUser, User } from '../schema.js';

const userColumns = {
  id: users.id,
  email: users.email,
  name: users.name,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
};

// users carries no account_id (ADR 0007) — a user's tenancy is expressed via
// account_memberships, so these lookups are unscoped by design.
export async function findUserById(id: string): Promise<User | null> {
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return rows[0] ?? null;
}

export async function createUser(input: NewUser): Promise<User> {
  const rows = await db.insert(users).values(input).returning();
  const user = rows[0];
  if (!user) {
    throw new Error('createUser: insert returned no row');
  }
  return user;
}

// Tenant-scoped form (C2): accountId first, explicit eq(...) in the where
// clause, enforced through the account_memberships join since that's where
// the account_id column actually lives for this entity.
export async function findUserInAccount(accountId: string, id: string): Promise<User | null> {
  const rows = await db
    .select(userColumns)
    .from(users)
    .innerJoin(accountMemberships, eq(accountMemberships.userId, users.id))
    .where(and(eq(users.id, id), eq(accountMemberships.accountId, accountId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function listUsersForAccount(accountId: string): Promise<User[]> {
  return db
    .select(userColumns)
    .from(users)
    .innerJoin(accountMemberships, eq(accountMemberships.userId, users.id))
    .where(eq(accountMemberships.accountId, accountId));
}
