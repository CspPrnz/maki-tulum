import { and, eq } from 'drizzle-orm';
import { db } from '../index.js';
import { properties } from '../schema.js';
import type { NewProperty, Property } from '../schema.js';

export async function findPropertyById(accountId: string, id: string): Promise<Property | null> {
  const rows = await db
    .select()
    .from(properties)
    .where(and(eq(properties.accountId, accountId), eq(properties.id, id)))
    .limit(1);
  return rows[0] ?? null;
}

export async function findPropertyBySlug(
  accountId: string,
  slug: string,
): Promise<Property | null> {
  const rows = await db
    .select()
    .from(properties)
    .where(and(eq(properties.accountId, accountId), eq(properties.slug, slug)))
    .limit(1);
  return rows[0] ?? null;
}

export async function listProperties(accountId: string): Promise<Property[]> {
  return db.select().from(properties).where(eq(properties.accountId, accountId));
}

export async function createProperty(
  accountId: string,
  input: Omit<NewProperty, 'accountId'>,
): Promise<Property> {
  const rows = await db
    .insert(properties)
    .values({ ...input, accountId })
    .returning();
  const property = rows[0];
  if (!property) {
    throw new Error('createProperty: insert returned no row');
  }
  return property;
}
