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

/**
 * Emails are stored and compared lowercased. Postgres `=` is case-sensitive, so
 * without this `Guest@example.test` and `guest@example.test` are two rows that
 * the unique index happily allows — which under magic-link auth (ADR 0005) is a
 * shadow-account waiting to happen. Normalizing in one place keeps the write
 * path and every lookup in agreement.
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// users carries no account_id (ADR 0007) — a user's tenancy is expressed via
// account_memberships, so these lookups are unscoped by design. The `Unscoped`
// suffix is deliberate: these must never be mistaken for an authorization
// check, and the safe, tenant-scoped calls below should be the shorter names.
export async function findUserByIdUnscoped(id: string): Promise<User | null> {
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function findUserByEmailUnscoped(email: string): Promise<User | null> {
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizeEmail(email)))
    .limit(1);
  return rows[0] ?? null;
}

export async function createUser(input: NewUser): Promise<User> {
  const rows = await db
    .insert(users)
    .values({ ...input, email: normalizeEmail(input.email) })
    .returning();
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
