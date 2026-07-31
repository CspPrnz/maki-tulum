# ADR 0007 — Tenant-scoped schema from day one

- **Date:** 2026-05-04
- **Status:** accepted
- **Context:** Maki Tulum has one account today — the compound. The implementation plan (§3.5) anticipates that the same backend could host a second compound later (a friend's villa, a managed-property network) without a rewrite. We need to decide whether to bake multi-tenancy in now or refactor later. Civion Safe is multi-tenant from day one and that worked; the cost is mostly upfront and small.
- **Decision:** Every domain table carries an `account_id UUID NOT NULL` column. Every query filters by `account_id` explicitly. The current single-tenant deployment uses one fixed account UUID; the schema, queries, and middleware behave as if N tenants exist.
- **Consequences:**
  - Adding a second tenant later is a row insert + admin onboarding flow, not a migration.
  - Every Drizzle table definition has `accountId: uuid('account_id').notNull().references(() => accounts.id)`.
  - Every Drizzle query that touches a tenant-scoped table goes through a repository helper that requires an explicit `accountId` parameter — see ADR 0008 for the enforcement layer.
  - `account_id` is part of all relevant composite indexes (`(account_id, created_at)`, `(account_id, status)`, etc.) so query planners stay happy as the table grows.
  - Joins always join on `account_id` as well as the foreign key. Cross-tenant joins are an instant code-review red flag.
  - We accept ~5% schema/code overhead for the optionality.
- **Alternatives considered:**
  - **Single-tenant flat schema** with a "we'll refactor later" promise — rejected. Refactors of this kind cost 10× more after data has accumulated, and the cost now is small.
  - **Schema-per-tenant** (e.g., one Postgres schema per account) — premature complexity for our scale; complicates migrations and connection pooling.
  - **Database-per-tenant** — same, more so.

## What "tenant-scoped" means in practice

| Layer                | Rule                                                                       |
| -------------------- | -------------------------------------------------------------------------- |
| Schema               | Every domain table has `account_id UUID NOT NULL`                          |
| Indexes              | `account_id` is the leading column (or part of) every multi-column index   |
| Repository functions | Take `accountId` as the first parameter; can't be omitted                  |
| Handlers             | Resolve `accountId` once from the JWT subject claim, pass to repos         |
| Joins                | Always include `account_id = account_id` even when foreign-key constrained |
| Audit log            | Every entry has `account_id`; viewing log is account-scoped                |
| Tests                | Cross-tenant integration test exists for every list/get endpoint           |

## Tables NOT scoped to `account_id`

- `accounts` itself
- `users` (users can belong to multiple accounts via `account_memberships`; each membership is account-scoped)
- `audit_log_partitions` metadata
- Public content if any (e.g., public guide articles — TBD)

## Related

- ADR 0008 — defense layers that ensure tenant isolation is _actually_ enforced even when a developer forgets.
