# Maki Tulum — AI Agent Context

> Last updated: 2026-05-04 · Stage: Phase 0 scaffold landed, ADRs 0001–0011 written · Deploy: Railway

## What this is

Direct-booking platform for **Maki Tulum**, a small jungle villa compound in Aldea Zama, Tulum. Owner-operated, escaping Airbnb/Booking.com dependency. Web-first; backend extensible to native iOS/Android later via the same API.

**Thesis (read first):** OTAs for acquisition, direct for retention. Every feature answers: *does this drive stay #2?*

## Read order

- **Why are we building this?** → [`idea-v3.md`](idea-v3.md)
- **How are we building it?** → [`implementation-plan.md`](implementation-plan.md)
- **What's next / blocked / deferred?** → [`docs/tasks/TODO.MD`](docs/tasks/TODO.MD)
- **What shipped, where?** → [`docs/feature-matrix.md`](docs/feature-matrix.md)
- **What bit us and why?** → [`docs/lessons-learned.md`](docs/lessons-learned.md)
- **Architecture decisions** → [`docs/adrs/`](docs/adrs/)
- **Older thinking** → `idea.md` (v1, ours) + `idea-v2.md` (Codex). Kept for lineage; do not edit.

## Current state

- **Phase 0 scaffold:** ✅ in repo — pnpm + Turbo monorepo, four packages (`config`, `types`, `i18n`, `ui`), `services/api` (Hono + Zod-OpenAPI, `/healthz`, `/readyz`, CORS, rate-limit, JSON error envelope, `sanitizeText`), `apps/web` (Next.js 15 + Tailwind v4, `/healthz`, brand tokens), dev docker-compose (Postgres 16 + Redis 7), GitHub Actions CI with service containers, env-audit script.
- **ADRs:** ✅ 0001–0011 written. 0004 (channel manager) is **deferred** (paused until live). 0010 supersedes the earlier "fold admin into apps/web" plan — admin lives in a separate `apps/admin` at `admin.makitulum.com` behind Cloudflare Access. 0011 picks Drizzle ORM + drizzle-kit migrations.
- **Phase 0 remaining:** ⚪ `pnpm install` to generate the lockfile, ⚪ install drizzle-orm + drizzle-kit and write the first migration (`accounts` + `users`), ⚪ Railway project provisioned + first staging deploy, ⚪ Sentry + Plausible wiring (need DSN + domain), ⚪ deployed `/healthz` smoke test green.
- **Phase 1 (marketing site):** ⚪ blocked on lockfile + first deploy.
- **Phase 3 (admin app):** ⚪ scaffold `apps/admin` Next.js app + Cloudflare Access setup when admin work begins.

## Stack (once Phase 0 ships)

- **Backend:** Node 22 + Hono + `@hono/zod-openapi` (spec-first)
- **DB:** PostgreSQL 16 (Railway-managed)
- **Cache / queue:** Redis (Railway addon) + BullMQ
- **Web:** Next.js 15 + React 19 + Tailwind v4
- **State:** Zustand (UI) + React Query v5 (server)
- **Auth:** Custom JWT, 15-min access + rotating refresh. Web: httpOnly cookies. Native (future): Keychain/Keystore.
- **Payments:** Stripe + MercadoPago
- **Channel sync:** TBD — adapter pattern in place; vendor decided at Phase 3 kickoff (ADR 0004 paused, Hosthub + Hostaway under consideration)
- **Email:** Postmark · **WhatsApp:** Twilio · **Errors:** Sentry · **Analytics:** Plausible

## Repo shape (target)

```
apps/web/              Next.js — public marketing + booking + guest area
apps/admin/            Next.js — owner / manager / housekeeping (Phase 3+)
                       admin.makitulum.com behind Cloudflare Access (ADR 0010)
services/api/          Hono API + Drizzle ORM (ADR 0009, 0011); same API serves web + admin + future native
packages/types/        Zod schemas + inferred TS types (shared client/server)
packages/ui/           Design system (tokens portable to RN/SwiftUI/Compose)
packages/i18n/         en / es / de locale files
packages/config/       env validation, constants, sanitizeText
infra/railway/         railway.toml per service
infra/docker/          dev docker-compose (Postgres + Redis)
scripts/               check-env, sync-tokens, sync-i18n (when native lands)
docs/adrs/             0001–0011 — read in order if new to the project
docs/tasks/TODO.MD     pending work; updated in the same commit
docs/feature-matrix.md per-feature status across web / admin / api / iOS / Android
docs/lessons-learned.md incidents → preventive measures
```

## Constraints (read before every task)

- **Spec-first.** API changes: edit the Zod schema + route, regenerate types. Never edit generated clients by hand.
- **Every response uses the envelope `{ data, meta, pagination? }`.** Errors: `{ error: { code, message, details? } }`. Always set `Content-Type: application/json` explicitly.
- **Every DB query filters by `account_id` explicitly.** No RLS dependency (Neon/Postgres default roles bypass it).
- **Idempotency keys required** on POSTs with non-idempotent side effects (bookings, payments, refunds, WhatsApp sends). Always check current state before performing the side effect.
- **JWT in httpOnly cookies on web.** Never localStorage. Access 15 min, refresh rotating.
- **Rate-limit every auth endpoint** from day one.
- **Sanitize every user-supplied text field** at the API boundary (`sanitizeText` in `packages/config`).
- **Validation parity:** every mutation endpoint validates the same constraints as create.
- **English route slugs**; localized display names live in i18n. No `/vorratshaltung`-style opaque paths.
- **`NEXT_PUBLIC_*` values must exist at Next.js build time.** Railway exposes service variables during both build and runtime, but anything exposed to the browser is baked into the bundle and therefore needs a rebuild when changed.
- **Railway healthcheck path must be a real route.** `/healthz` exists on both `web` and `api`.
- **Docker images pinned by SHA digest.** Never `:latest`.
- **Test data uses `@example.test`** (RFC 2606). Never realistic PII.
- **CORS allowlist is environment-scoped.** Production excludes localhost.
- **Inputs ≥ 16px font-size** (iOS Safari zoom-on-focus). Touch targets ≥ 44×44px.
- **`afterEach(cleanup)`** is mandatory in Vitest + React Testing Library tests.
- **`refetchOnWindowFocus: true`** in React Query. Add a `visibilitychange` listener + 401 interceptor for wake-from-sleep.

## Don't do (v1)

- Don't build a custom multi-role back office. The Hostaway + Breezeway + Enso stack covers roles for us.
- Don't build an AI concierge. It's Phase 6+.
- Don't build a custom channel-sync engine.
- Don't build a loyalty points system.
- Don't add native mobile apps yet. Backend is designed for them, but web ships first.
- Don't introduce a new external service without an adapter in `services/api/src/adapters/` + a fake for tests.
- Don't skip translations. Any user-facing string lands in `packages/i18n` for all 3 locales in the same commit.
- Don't add Kubernetes. Railway is sufficient.
- Don't over-comment. Names + types first; comments only where WHY is non-obvious.

## Known stubs (placeholders — don't build on top of them)

- *(none yet — update as we ship)*

## Conventions

- **Commits:** one concern per commit. Imperative mood. Reference phase if useful: `[phase-1] add stays page`.
- **Branches:** `feat/…`, `fix/…`, `chore/…`. PRs require green CI before merge.
- **DB migrations:** drizzle-kit (ADR 0011). Edit `services/api/src/db/schema.ts`, run `pnpm --filter @maki/api db:generate`, review the generated SQL, commit. Never edit a shipped migration.
- **DB queries:** only repositories at `services/api/src/db/repositories/<entity>.ts` import `db` directly. Handlers call repos. Every tenant-scoped repo function takes `accountId` as the first param (ADR 0007, 0008).
- **Tests:** co-located `.test.ts(x)`. Table-driven where input space is enumerable. Unique test data per run (`test+${nanoid()}@example.test`).
- **Every P0/P1 bug fix ships with a regression test.** No fix is "done" without one.
- **i18n keys** in `packages/i18n`; never inline English strings in components.
- **German content:** Unicode only — ä/ö/ü, never `ae`/`oe`/`ue`. CI lint rule enforces this.
- **Env vars** declared in `packages/config/env.ts` with Zod. A pre-deploy `scripts/check-env.ts` audits them.
- **Platform parity:** when mobile arrives, update `docs/feature-matrix.md` in the same PR as the feature.

## Quick start

```bash
pnpm install                                # generate lockfile + install workspaces
pnpm dev:up                                 # Postgres + Redis via docker compose
cp services/api/.env.example services/api/.env
cp apps/web/.env.example apps/web/.env.local
pnpm dev                                    # api on :3001, web on :3000
pnpm typecheck                              # cross-package
pnpm test                                   # vitest (unit, integration once we add DB tests)
pnpm check-env                              # audit process.env vs manifest in scripts/check-env.ts
```

API smoke: `curl localhost:3001/healthz` · `curl localhost:3001/openapi.json`
Web smoke: `curl localhost:3000/healthz`

## Running discipline

The meta-rule from the Innovation Factory. Do not skip steps.

1. **Document as you build.** Significant decisions → `docs/adrs/NNNN-slug.md` in the same commit as the code. Significant = something a future maintainer would reasonably question.
2. **Lessons in the moment.** Any bug / miswrite / red-team finding / >30-min debugging session → append a row to [`docs/lessons-learned.md`](docs/lessons-learned.md) (`Date | Issue | Root cause | Preventive measure`). Preventive measure must be actionable.
3. **Feature matrix stays in sync.** Every feature ships with its row in [`docs/feature-matrix.md`](docs/feature-matrix.md) updated in the same commit. Use `✅ / 🟡 / ⚪ / n/a`. Mark `n/a` explicitly.
4. **TODO status in the same commit.** "Done" = shipped + tested + documented + TODO updated. Not "code written."
5. **CLAUDE.md "Current state" reflects reality.** Update the section *before* doing work that would invalidate it.
6. **Structure sync.** When you add / rename / move files, update the repo-shape section above and grep the repo for references.
7. **Red-team findings get captured.** Every pass (Codex critique, persona UAT) → findings filed as TODOs, fixes filed as lessons. Write down the attack vector, not just the fix.
8. **Explicit over tidy.** Explicit `⚪ Planned` beats a silent gap. Explicit `N/A — see ADR-0005` beats silence.

After every meaningful session, consider running `/sync-inno-factory-knowledge` from the Innovation Factory plugin to push new lessons upstream.

## When in doubt

1. Does it drive stay #2? If not, defer.
2. Can we buy this? If yes, buy it and wrap it in an adapter.
3. Is the behavior testable? If not, restructure until it is.
4. Ask Felix before spending on a new third-party service.
5. Have I updated `TODO.MD`, `feature-matrix.md`, and CLAUDE.md's Current state in this commit?
