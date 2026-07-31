# AGENTS.md

Vendor-neutral mirror of the load-bearing subset of [`CLAUDE.md`](CLAUDE.md) for Codex, Cursor, Aider, and Copilot.

**On conflict, `CLAUDE.md` wins.** It is the source of truth; this file is a projection of it. Changing a rule means changing both in the same commit.

## What this is

Direct-booking platform for Maki Tulum, a jungle villa compound in Aldea Zama, Tulum. Owner-operated, escaping OTA dependency. Web-first; the API is designed to serve native clients later.

**Thesis:** OTAs for acquisition, direct for retention. Every feature answers: _does this drive stay #2?_

**Tier: T2** — multi-tenant seam, customer PII, payments. T2 controls are additive on top of T1/T0, never swappable for a different set.

## Orientation

- Current state, phase status, next actions → [`docs/backlog/TODO.MD`](docs/backlog/TODO.MD)
- Last session → newest file in [`docs/handoff/`](docs/handoff/)
- Why → [`idea-v3.md`](idea-v3.md) · How → [`implementation-plan.md`](implementation-plan.md)
- Domain terms → [`CONTEXT.md`](CONTEXT.md)
- Decisions → [`docs/adrs/`](docs/adrs/)

## Non-negotiable constraints

1. **Spec-first.** API changes edit the Zod schema + route, then regenerate types. Never hand-edit a generated client.
2. **Response envelope** `{ data, meta, pagination? }`; errors `{ error: { code, message, details? } }`. Always set `Content-Type: application/json` explicitly.
3. **Every tenant-scoped query filters `account_id` explicitly.** No RLS dependency. Repo functions take `accountId` as the first param.
4. **Only repositories** (`services/api/src/db/repositories/<entity>.ts`) import `db`. Handlers call repos.
5. **Idempotency keys** on POSTs with non-idempotent side effects (bookings, payments, refunds, WhatsApp sends). Check current state before performing the side effect.
6. **Sanitize every user-supplied text field** at the API boundary (`sanitizeText` in `packages/config`).
7. **Validation parity** — every mutation endpoint validates what its create counterpart validates.
8. **JWT in httpOnly cookies on web**, never localStorage. Access 15 min, rotating refresh.
9. **Rate-limit every auth endpoint** from day one. CORS allowlist is environment-scoped; production excludes localhost.
10. **i18n:** every user-facing string lands in `packages/i18n` for EN/ES/DE in the same commit. English route slugs only. German uses real Unicode (ä/ö/ü, never ae/oe/ue) — CI enforces it.
11. **A11y:** inputs ≥16px font-size, touch targets ≥44×44px.
12. **Tests:** co-located `.test.ts(x)`, `afterEach(cleanup)` mandatory in RTL tests, unique test data per run, `@example.test` domains only, never realistic PII. Every P0/P1 fix ships with a regression test.
13. **Docker images pinned by SHA digest.** Never `:latest`.
14. **No new external service without an adapter** in `services/api/src/adapters/` plus a fake for tests.
15. **Migrations:** edit `services/api/src/db/schema.ts`, run drizzle-kit generate, review the SQL, commit. Never edit a shipped migration.
16. **`NEXT_PUBLIC_*` is build-time.** Changing one requires a rebuild.

## Evidence discipline

Claims are not evidence. Back every tested unit with the artifact that proves it: the command + output tail, the `curl` + real status and body, the SQL + a query showing the object exists, the diff or SHA, a fresh health probe for a deploy.

Report faithfully — a skipped or blocked step is stated in the same breath as the successes. Label findings _independently verified_ vs _agent-reported_. The one who writes is not the one who grades.

## Don't

Don't build a custom back office, an AI concierge, a channel-sync engine, or a loyalty system in v1. Don't add native apps yet. Don't add Kubernetes. Don't skip translations. Don't leave stubs that look like working code. Don't commit without being asked.

## Commands

```bash
pnpm install
pnpm dev:up        # Postgres + Redis
pnpm dev           # api :3001, web :3000
pnpm verify        # check-env · format · typecheck · lint · test · build — mirrors CI
```

## Running discipline

Every change updates, **in the same commit**: `docs/backlog/TODO.MD` status, the relevant `docs/feature-matrix.md` row, and `CLAUDE.md`'s Current state if it moved. Significant decisions get an ADR. Anything that bit you gets a row in `docs/lessons-learned.md` with an _actionable_ preventive measure. Red-team findings are filed as TODOs — write down the attack vector, not just the fix.
