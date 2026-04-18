# Maki Tulum — AI Agent Context

> Last updated: 2026-04-18 · Stage: Planning, no code yet · Deploy: Railway

## What this is

Direct-booking platform for **Maki Tulum**, a small jungle villa compound in Aldea Zama, Tulum. Owner-operated, escaping Airbnb/Booking.com dependency. Web-first; backend extensible to native iOS/Android later via the same API.

**Thesis (read first):** OTAs for acquisition, direct for retention. Every feature answers: *does this drive stay #2?*

## Read order

- **Why are we building this?** → [`idea-v3.md`](idea-v3.md)
- **How are we building it?** → [`implementation-plan.md`](implementation-plan.md)
- **What's next / blocked / deferred?** → [`docs/tasks/TODO.MD`](docs/tasks/TODO.MD) — the single source of truth for pending work. Update in the same commit as the feature.
- **Older thinking** → `idea.md` (v1, ours) + `idea-v2.md` (Codex). Kept for lineage; do not edit.
- **Architecture decisions** → `docs/adrs/` (once created)

## Current state

- No code yet. Repo is empty apart from planning docs.
- Next action: Phase 0 of `implementation-plan.md` — monorepo skeleton + Railway + CI.
- Railway account exists at user level; project not yet provisioned.

## Stack (once Phase 0 ships)

- **Backend:** Node 22 + Hono + `@hono/zod-openapi` (spec-first)
- **DB:** PostgreSQL 16 (Railway-managed)
- **Cache / queue:** Redis (Railway addon) + BullMQ
- **Web:** Next.js 15 + React 19 + Tailwind v4
- **State:** Zustand (UI) + React Query v5 (server)
- **Auth:** Custom JWT, 15-min access + rotating refresh. Web: httpOnly cookies. Native (future): Keychain/Keystore.
- **Payments:** Stripe + MercadoPago
- **Channel sync:** Hostaway (candidate; not yet contracted)
- **Email:** Postmark · **WhatsApp:** Twilio · **Errors:** Sentry · **Analytics:** Plausible

## Repo shape (target)

```
apps/web/              Next.js — marketing + booking + /admin
services/api/          Hono API, the contract
packages/types/        Zod schemas + inferred TS types (shared client/server)
packages/ui/           Design system (tokens portable to RN/SwiftUI/Compose)
packages/i18n/         en / es / de locale files
packages/config/       env validation, constants
infra/railway/         railway.toml per service
infra/docker/          dev docker-compose (Postgres + Redis)
scripts/               seed, sync-i18n, check-env
docs/                  adrs/, runbooks/, feature-matrix.md
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
- **`NEXT_PUBLIC_*` env vars are Docker build args, not runtime.** Railway: set as "build variables."
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
- **DB migrations:** `node-pg-migrate` up + down, idempotent. Never edit a shipped migration.
- **Tests:** co-located `.test.ts(x)`. Table-driven where input space is enumerable. Unique test data per run (`test+${nanoid()}@example.test`).
- **Every P0/P1 bug fix ships with a regression test.** No fix is "done" without one.
- **i18n keys** in `packages/i18n`; never inline English strings in components.
- **German content:** Unicode only — ä/ö/ü, never `ae`/`oe`/`ue`. CI lint rule enforces this.
- **Env vars** declared in `packages/config/env.ts` with Zod. A pre-deploy `scripts/check-env.ts` audits them.
- **Platform parity:** when mobile arrives, update `docs/feature-matrix.md` in the same PR as the feature.

## Quick start (once Phase 0 ships)

```bash
pnpm install
pnpm dev:up        # Postgres + Redis in Docker
pnpm dev           # api + web
pnpm test          # unit + component + integration (Testcontainers)
pnpm test:e2e      # Playwright against local
```

## When in doubt

1. Does it drive stay #2? If not, defer.
2. Can we buy this? If yes, buy it and wrap it in an adapter.
3. Is the behavior testable? If not, restructure until it is.
4. Ask Felix before spending on a new third-party service.
5. Update `docs/tasks/TODO.MD` in the same commit as the change it describes.
