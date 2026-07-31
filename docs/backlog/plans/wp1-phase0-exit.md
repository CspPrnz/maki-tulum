---
id: wp1-phase0-exit
title: Close Phase 0 — persistence, integration tests, observability, deploy readiness
status: done # draft | approved | in_progress | blocked | done
phase: 0
owner: orchestrator
created: 2026-07-31
updated: 2026-07-31
depends_on: []
---

# WP-1 — Close Phase 0

## Goal

Phase 0's exit criterion is currently unmet and has been since May: nothing is deployed, there is no database schema, no integration test touches a real Postgres, and CI has never been green. After this work package, the repo has a real persistence layer with a reviewed first migration, integration tests running against ephemeral Postgres + Redis, error/analytics instrumentation behind env flags, and a deploy path that only needs Felix to click "create project" in Railway.

## Why now

Every later phase compounds on this. Phase 2's booking schema cannot be designed without Drizzle in place; the red-team's money-integrity and tenant-isolation invariants (MRT-15-P1-08, ADR 0007/0008) are untestable without integration tests against a real DB; and no deploy means no staging URL to run persona UAT or Lighthouse against. This is also the last moment where the foundation is cheap to change.

Does it drive stay #2? Not directly — it is the substrate the retention loop runs on. That is the honest framing.

## Pinned contracts

> Fixed before any agent is spawned. Workers build against these, not against each other's code.
> A contract change mid-flight is messaged to the in-flight owner immediately — never patched silently at integration.

### C1 — Drizzle layout and naming

```
services/api/drizzle.config.ts
services/api/src/db/index.ts            # exports `db`, the only module that constructs a client
services/api/src/db/schema.ts           # all tables; single file until it exceeds ~400 lines
services/api/src/db/repositories/<entity>.ts
services/api/migrations/NNNN_*.sql      # drizzle-kit generated; never hand-edited after commit
```

- Tables `snake_case` plural. Primary keys `uuid` with `defaultRandom()`. Timestamps `created_at` / `updated_at`, `timestamptz`, not null, defaulted.
- **Every tenant-scoped table carries `account_id uuid not null references accounts(id)`,** with an index on it — even though there is one account today (ADR 0007).
- `accounts` itself is the tenant root and has no `account_id`.

### C2 — Repository signature

`accountId` is **always the first parameter** on tenant-scoped functions, and always appears as an explicit `eq(...)` in the where clause. Only files under `src/db/` import `db`; handlers call repositories (ADR 0008).

```ts
// services/api/src/db/repositories/properties.ts — tenant-scoped
export async function findPropertyById(accountId: string, id: string): Promise<Property | null>;
```

> **Corrected 2026-07-31 (stream A raised this).** The original version of this contract used `users` as the example and had `findUserById(accountId, id)`. That contradicts **ADR 0007**, which states that `users` is _not_ `account_id`-scoped — a user can belong to several accounts, and tenancy is expressed only through `account_memberships`. The correct shape is unscoped `findUserById(id)` / `findUserByEmail(email)` / `createUser(input)`, plus genuinely tenant-scoped `findUserInAccount(accountId, id)` and `listUsersForAccount(accountId)` that join through memberships. Use `properties` as the mental model for a tenant-scoped table, not `users`.

### C3 — First migration scope

`0001_init`: `accounts`, `users`, `account_memberships`, `properties`. Nothing else — no bookings, no payments, no rates. Those wait for the Phase 2 blockers to clear (MRT-15-P0-02: the channel-manager vendor defines the availability/rate shape, so freezing it now would be the exact mistake the red-team flagged).

`account_memberships` carries `role` as a pg enum whose members are **exactly** the canonical `Role` in `packages/types/src/index.ts`: `guest | owner | manager | housekeeping | maintenance | admin`.

> **Corrected 2026-07-31 (stream A raised this).** This contract originally invented `housekeeper | contractor`, which drifts from the canonical enum that already existed. Status enums are defined once in the shared package and re-exported — never redefined per consumer. A test asserts the DB enum matches `Role` so the two cannot silently diverge again.

### C4 — Test app factory

`services/api/src/app.ts` exports `createApp(deps)` so integration tests can inject a test DB/Redis instead of reaching for module-level singletons. **The orchestrator makes this edit before fan-out** (see Seams below) — no worker touches `app.ts`.

### C5 — Env vars

New names are declared in `packages/config/src/env.ts` **and** in `scripts/check-env.ts`'s `KNOWN_ENV` in the same change, or `pnpm verify` fails at step 1:

| Name                           | Service | Notes                                                      |
| ------------------------------ | ------- | ---------------------------------------------------------- |
| `SENTRY_DSN`                   | api     | optional; absent = instrumentation is a no-op, not a crash |
| `NEXT_PUBLIC_SENTRY_DSN`       | web     | build arg                                                  |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | web     | build arg; absent = script not rendered                    |
| `NEXT_PUBLIC_SITE_URL`         | web     | build arg; already used by `metadataBase`                  |

### C6 — Response envelope (unchanged, restated because streams B and C both assert on it)

Success `{ data, meta, pagination? }` · error `{ error: { code, message, details? } }` · `Content-Type: application/json` always set explicitly.

## Streams

| ID    | Goal                                                     | Owns (exclusive write)                                                                                                                                    | Reads only                                                | Depends on                         |
| ----- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ---------------------------------- |
| **A** | Drizzle + first migration + repository pattern           | `services/api/src/db/**`, `services/api/drizzle.config.ts`, `services/api/migrations/**`, `services/api/package.json`                                     | `packages/config/**`, ADRs 0007/0008/0011                 | —                                  |
| **B** | Integration + contract tests against real Postgres/Redis | `services/api/test/**`, `services/api/src/**/*.integration.test.ts`, `services/api/vitest.config.ts`                                                      | `services/api/src/app.ts`, stream A's schema (after gate) | A's `schema.ts` + migration merged |
| **C** | Observability + env plumbing                             | `packages/config/src/env.ts`, `scripts/check-env.ts`, `services/api/src/observability.ts`, `apps/web/app/layout.tsx`, `apps/web/components/analytics.tsx` | `services/api/src/app.ts`                                 | —                                  |
| **D** | Deploy readiness + supply chain                          | `infra/railway/**`, `apps/web/Dockerfile`, `services/api/Dockerfile`, `.github/workflows/ci.yml`, `scripts/smoke.ts`                                      | everything                                                | —                                  |

**Ownership rule check:** no path appears in two `Owns` cells. `services/api/src/app.ts` is _read-only for every stream_ — the orchestrator owns it and edits it once, up front.

### Stream detail

**A — persistence.** Add `drizzle-orm`, `drizzle-kit`, `drizzle-zod`, `postgres`. Write `schema.ts` per C1/C3, generate the migration, review the SQL by hand, apply it against local Postgres, write `repositories/{accounts,users,properties}.ts` per C2 with unit tests. Do **not** invent booking/rate tables.

**B — test harness.** Testcontainers-backed ephemeral Postgres + Redis. Cover: `/healthz` 200, `/readyz` reflecting real DB+Redis reachability (and going unhealthy when they're down), CORS allowlist behaviour in prod vs local config, the JSON error envelope shape, and rate-limit 429 with a **test-mode allowlist** so the suite doesn't 429 itself. Add contract assertions validating responses against `/openapi.json`. Add a tenant-isolation test: two accounts, a repo call with account A's id must not return account B's row.

**C — observability.** Sentry in api + web, Plausible on web, all behind env flags such that a missing DSN is a silent no-op rather than a startup failure. Reconcile `env.ts` with `check-env.ts` — they currently drift, and the Postmark/Twilio names must go (superseded by ADR 0012 Brevo; `BREVO_API_KEY` replaces them).

**D — deploy readiness.** Pin every Docker base image by SHA digest and every GitHub Action to a commit SHA (currently floating `@v4`). Verify healthcheck paths in both `railway.toml` files match real routes. Write `scripts/smoke.ts` — hits a deployed `/healthz` and `/readyz`, exits non-zero on failure — and a Railway runbook in `infra/railway/README.md` precise enough that Felix's part is clicking through a checklist. Add the smoke step to CI as a post-deploy job (allowed to no-op until a staging URL exists).

## Acceptance evidence

| Stream | Command / probe                                                                  | What proves it                                                                                    |
| ------ | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| A      | `pnpm --filter @maki/api db:generate` then `psql $DATABASE_URL -c '\d accounts'` | the generated SQL **and** a query showing the table exists with an `account_id` FK where expected |
| A      | `pnpm --filter @maki/api test`                                                   | repository unit tests, counts + names                                                             |
| B      | `pnpm --filter @maki/api test`                                                   | integration test names + counts; the 429 and the tenant-isolation assertions named explicitly     |
| B      | `curl -s -i localhost:3001/readyz` with Postgres stopped                         | real non-200 status + body, not a described one                                                   |
| C      | `pnpm check-env`                                                                 | `✓ env audit passed` with the new names declared                                                  |
| C      | app boot with no `SENTRY_DSN` set                                                | log tail showing clean startup, not a crash                                                       |
| D      | `rg ':latest\|@v4' .github apps/*/Dockerfile services/*/Dockerfile`              | empty output                                                                                      |
| all    | `pnpm verify` on the integrated tree                                             | full green, mirroring CI                                                                          |
| all    | `gh run list --limit 1`                                                          | conclusion **success** — the first green run in this repo's history                               |

Claims are not evidence. Every row is re-run by the orchestrator, not taken from a worker transcript.

## Out of scope

- Any booking, rate, availability, quote, or payment table (blocked on MRT-15-P0-01/02/03).
- Auth implementation — magic link, JWT issuance, refresh rotation. Phase 3. The schema carries `users` so the seam exists; no handlers.
- `apps/admin` scaffold. Phase 3.
- Phase 1B content, ambient video, MDX guide framework, Lighthouse sign-off. Separate work package.
- The actual Railway provisioning, DNS, and Sentry/Plausible account creation — human-owned, below.

## Human-owned (Felix)

1. Create the Railway project + 4 services (web, api, postgres, redis); paste the URLs back.
2. Decide **Railway-managed Postgres vs. Neon** — open decision in `TODO.MD`, and stream A's connection setup is trivially portable either way, so this can land after.
3. Create Sentry projects (web + api) and a Plausible site; provide DSNs + domain.
4. DNS: apex + `api.` + `staging.` → Railway.
5. Approve any spend before it is incurred.

## Close-out checklist

- [x] `pnpm verify` green on the integrated tree — 97 tests, migration inside the gate
- [x] `verifier` + `security-reviewer` passes on the full diff; all P1s fixed with regression tests
- [x] `docs/backlog/TODO.MD` status updated
- [x] `docs/feature-matrix.md` rows updated
- [x] `CLAUDE.md` Current state reconciled
- [x] Six lessons appended to `docs/lessons-learned.md`
- [x] ADR 0016 written (payment capture redesign)
- [x] Handoff written + indexed
- [x] `status: done` — **staging responds.** Both services live, smoke test green, schema
      migrated. Held open until this was true rather than closing when the code was written.
