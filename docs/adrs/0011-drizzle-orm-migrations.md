# ADR 0011 — Drizzle ORM + drizzle-kit migrations

- **Date:** 2026-05-04
- **Status:** accepted
- **Context:** We need a migration tool and a query layer. The implementation plan named `node-pg-migrate` in passing (§4 Phase 0); revisiting before we write the first table. Civion Safe used Go + raw SQL successfully but lost type safety on query results. Drift between the DB schema and the application's mental model of it caused several Civion lessons (status string mismatches, envelope drift, Register vs UpdateMe validation parity gaps).
- **Decision:** Adopt **Drizzle ORM (`drizzle-orm`) + drizzle-kit migrations** as the single source of DB schema and the primary query layer. Schema lives in `services/api/src/db/schema.ts`. Migrations are generated from schema diffs (`drizzle-kit generate`), reviewed, hand-edited if needed, and applied (`drizzle-kit migrate`).
- **Consequences:**
  - **End-to-end type safety** from schema → query → result row. The compiler catches column renames, type changes, and most query-result-shape drift.
  - **Single schema source.** `drizzle-zod` derives Zod schemas from Drizzle tables, so DB types and API I/O types come from one declaration. This collapses the "defined once, re-exported to clients" rule into a single source.
  - **Generated SQL migrations are reviewable + tweakable.** We don't lose the ability to write the exact SQL we want.
  - **Escape hatch is one line.** Complex queries (CTEs, window functions, full-text search) use `db.execute(sql\`…\`)` — no ceremony, full Postgres power.
  - **Repository pattern is natural** with Drizzle: each `services/api/src/db/repositories/<entity>.ts` exports query functions that take `accountId` (ADR-0007) and return typed rows.
  - Cost: ~150 KB added to the API bundle, one DSL to learn.
- **Alternatives considered:**
  - **`node-pg-migrate` + raw `pg` queries** — older, proven, simpler dependency tree. No type safety on queries (we'd hand-maintain types and they'd drift). Civion-class lessons make this the wrong default for us.
  - **Kysely** (typed query builder, no schema source) — strong middle option. Loses the auto-migration-from-schema benefit and the `drizzle-zod` integration. Reasonable second choice if Drizzle stops being maintained.
  - **Prisma** — heavier, slower cold start on Node, less SQL-idiomatic. Rejected.
  - **TypeORM / MikroORM** — entity-decorator style; weaker type safety than Drizzle. Rejected.

## Set-up checklist (next session, when first table is written)

```bash
pnpm --filter @maki/api add drizzle-orm pg
pnpm --filter @maki/api add -D drizzle-kit @types/pg drizzle-zod
```

Files to create:

- `services/api/drizzle.config.ts` — points at `src/db/schema.ts` + `migrations/` dir.
- `services/api/src/db/schema.ts` — table definitions in TS.
- `services/api/src/db/index.ts` — `db` client created from `DATABASE_URL`.
- `services/api/src/db/repositories/` — per-entity query helpers.
- `services/api/migrations/` — generated SQL files (committed).

Add scripts to `services/api/package.json`:

```json
"db:generate": "drizzle-kit generate",
"db:migrate": "drizzle-kit migrate",
"db:studio": "drizzle-kit studio"
```

## Rules

- **Handlers do not import `db` directly.** Only repositories do. ESLint rule + code review.
- **Every repository function takes `accountId` as the first parameter** for tenant-scoped tables (ADR-0007).
- **Migrations are committed.** `pnpm db:generate` produces SQL; review it before commit.
- **Never edit a shipped migration.** Add a new one.
- **Test fakes** for repository interfaces live alongside (`bookings.fake.ts`) for integration tests that don't want to spin up a real DB.
- For queries Drizzle's API can't express cleanly, use `sql\`…\``. Don't fight the ORM.
