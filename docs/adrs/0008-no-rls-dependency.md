# ADR 0008 — No Postgres RLS dependency for tenant isolation; defense in depth

- **Date:** 2026-05-04
- **Status:** accepted
- **Context:** Postgres's Row-Level Security (RLS) is a feature where a table-level policy filters which rows a query can see based on the connecting role and session variables. It sounds like the perfect tenant-isolation primitive. Civion Safe found out it isn't.

  The Civion lesson (multiple 2026-03-29 / 2026-04-01 / 2026-04-02 entries in `lessons-learned.md`): **Neon's default `neondb_owner` role has `BYPASSRLS`.** When the application connects as the role Postgres provisions for you by default, RLS policies are decorative — every query sees every row, and tenant-isolation tests pass against `localhost` while silently failing in staging. Civion ate this on shelter endpoints, content endpoints, and admin endpoints before catching it.

- **Decision:** **Treat Postgres RLS as defense-in-depth, not as the primary isolation mechanism.** Tenant isolation is enforced in **four overlapping layers**:
  1. **Application layer (primary).** Every query has an explicit `WHERE account_id = $1`. Drizzle repository helpers accept `accountId` as a required parameter; the type system refuses calls without it.
  2. **Repository pattern.** All DB access goes through `services/api/src/db/repositories/<entity>.ts`. Handlers cannot import `db` directly — ESLint rule + code review. Repositories are unit-tested with cross-tenant fixtures (account A inserts a row, account B's repository call must not see it).
  3. **CI grep check.** A grep-based check runs in CI: any SQL referencing a tenant-scoped table without a tenant filter fails the build. Modeled on Civion's `current_setting('app.current_tenant')` check.
  4. **Restricted DB role for production (defense in depth).** A least-privileged role `maki_app` (no `BYPASSRLS`) connects from production. RLS policies _are_ attached to every tenant-scoped table — they enforce isolation if/when the application layer fails. Migrations run as the elevated role; the application never does.

- **Consequences:**
  - We don't depend on RLS being enforced — and isolation is correct even on Neon, even in dev.
  - We get RLS as a real safety net in production via the restricted role.
  - Cost: discipline (every query tagged), repository pattern, one grep CI check, and one extra DB role to provision.
  - Defense in depth means a single bug in any one layer is not catastrophic.

## What this looks like in code

```ts
// services/api/src/db/repositories/bookings.ts
export async function listBookings(accountId: string, filters: BookingFilters) {
  return db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.accountId, accountId), // <-- never optional
        ...filterClauses(filters),
      ),
    );
}

// Calling code can't omit accountId — the type system enforces it.
```

```sql
-- migrations/000001_init.sql (or Drizzle-generated equivalent)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON bookings
  USING (account_id = current_setting('app.current_account', true)::uuid);
```

```ts
// services/api/src/middleware/account-context.ts
// On every authenticated request, set the per-tx GUC so RLS has something to check
await tx.execute(sql`SET LOCAL app.current_account = ${accountId}`);
```

## Row-level vs. column-level security

The user asked: **"how do we ensure row and column-level security?"** Distinct concerns, distinct answers:

### Row-level (the harder question)

Covered by the four layers above. Multi-layer because no single layer is reliable in our hosting context.

### Column-level (sensitive PII / payment data)

RLS only handles rows. Column-level protection is separate:

- **Don't `SELECT *`.** Repository functions select explicit columns only. Sensitive columns (e.g., `users.email_hash`, `payments.stripe_payment_intent_id`) are returned **only** by repositories whose callers have a documented need.
- **Encrypt sensitive columns at rest** for special-category data. Use [pgcrypto](https://www.postgresql.org/docs/current/pgcrypto.html) with a key from Railway env (or [libsodium](https://libsodium.gitbook.io/) for app-layer encryption with key rotation). For Phase 1–2, **payment tokens are stored as Stripe IDs**, not card data — Stripe is the vault. PII like `email` is hashed for indexing + plaintext for display, accepted as a v1 risk if needed.
- **Audit-log every read of sensitive columns.** Repositories that touch sensitive data emit an audit-log entry on read.
- **Role-aware projections in handlers.** A `manager` viewing a guest's booking sees first-name + party size; an `owner` sees the full booking. The repository returns the full row; the handler projects based on the JWT role claim.

Special-category data (GDPR Art. 9 — health, etc.) is **out of scope for v1.** Maki doesn't need it; if it ever did, that triggers a new ADR and field-level encryption from day one.

## Alternatives considered

- **RLS as primary isolation.** Rejected — Civion's documented incidents.
- **Skip RLS entirely.** Rejected — the restricted-role + RLS combination is real defense in depth, and the cost of having RLS policies is low when we already have the explicit filters.
- **App-layer + database-per-tenant.** Rejected — premature complexity at our scale.
