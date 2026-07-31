import { eq } from 'drizzle-orm';
import { db } from '../index.js';
import { accounts } from '../schema.js';
import type { Account, NewAccount } from '../schema.js';

// accounts is the tenant root (ADR 0007) — it carries no account_id, so these
// functions are intentionally not accountId-scoped.
export async function findAccountById(id: string): Promise<Account | null> {
  const rows = await db.select().from(accounts).where(eq(accounts.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function createAccount(input: NewAccount): Promise<Account> {
  const rows = await db.insert(accounts).values(input).returning();
  const account = rows[0];
  if (!account) {
    throw new Error('createAccount: insert returned no row');
  }
  return account;
}
