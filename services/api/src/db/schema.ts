import { sql } from 'drizzle-orm';
import { pgEnum, pgTable, index, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
};

// Tenant root (ADR 0007). No account_id column here.
export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  ...timestamps,
});

// Not tenant-scoped: a user can hold memberships in multiple accounts (ADR 0007).
export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: text('email').notNull(),
    name: text('name'),
    ...timestamps,
  },
  // Uniqueness is on lower(email): Postgres `=` is case-sensitive, so a plain
  // index lets Guest@… and guest@… coexist as separate identities. Writes go
  // through normalizeEmail(); the functional index is the backstop that holds
  // even if a future caller forgets.
  (table) => [uniqueIndex('users_email_lower_key').on(sql`lower(${table.email})`)],
);

// Values mirror the canonical `Role` enum in packages/types/src/index.ts —
// defined once there, not redefined per client. See db/repositories users.test.ts
// for the drift guard.
export const membershipRoleEnum = pgEnum('membership_role', [
  'guest',
  'owner',
  'manager',
  'housekeeping',
  'maintenance',
  'admin',
]);

export const accountMemberships = pgTable(
  'account_memberships',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    accountId: uuid('account_id')
      .notNull()
      .references(() => accounts.id),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    role: membershipRoleEnum('role').notNull(),
    ...timestamps,
  },
  (table) => [
    index('account_memberships_account_id_idx').on(table.accountId),
    index('account_memberships_user_id_idx').on(table.userId),
    uniqueIndex('account_memberships_account_id_user_id_key').on(table.accountId, table.userId),
  ],
);

export const propertyStatusEnum = pgEnum('property_status', ['draft', 'active', 'inactive']);

export const properties = pgTable(
  'properties',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    accountId: uuid('account_id')
      .notNull()
      .references(() => accounts.id),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    status: propertyStatusEnum('status').notNull().default('draft'),
    ...timestamps,
  },
  (table) => [
    index('properties_account_id_idx').on(table.accountId),
    uniqueIndex('properties_account_id_slug_key').on(table.accountId, table.slug),
  ],
);

export const insertAccountSchema = createInsertSchema(accounts);
export const selectAccountSchema = createSelectSchema(accounts);
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const insertAccountMembershipSchema = createInsertSchema(accountMemberships);
export const selectAccountMembershipSchema = createSelectSchema(accountMemberships);
export type AccountMembership = typeof accountMemberships.$inferSelect;
export type NewAccountMembership = typeof accountMemberships.$inferInsert;

export const insertPropertySchema = createInsertSchema(properties);
export const selectPropertySchema = createSelectSchema(properties);
export type Property = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;
