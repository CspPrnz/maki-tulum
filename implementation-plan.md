# Maki Tulum — Implementation Plan

> How we build `idea-v3.md`. Spec-first, web-first, mobile-ready. Lean.
>
> **Last updated:** 2026-07-15 · **Status:** Phase 0 + Phase 1A shipped, Phase 2 kickoff gated on red-team findings · **Deploy target:** Railway

---

## Current state

- `idea-v3.md` is the product thesis. This plan is how we build it.
- Phase 0 (monorepo, API/web scaffolds, CI) and Phase 1A (locale-routed marketing site, Villa 18 + 19) are shipped — see `CLAUDE.md` Current state and `docs/backlog/TODO.MD` for the live status; this file tracks the build approach, not day-to-day state.
- Railway staging deploy + Drizzle migration are the next unblocked Phase 0 items (Felix-side, see TODO.MD).
- Brand assets exist in the WordPress dump (palette, wordmark, photography).
- A Codex red-team pass (2026-07-15, `docs/backlog/plans/codex-red-team.md`) found P0 issues in the Phase 2 design below (payment capture, channel-manager sequencing, legal entity/consent) — read that log before starting Phase 2 implementation.

---

## 1. Guiding principles

1. **Spec-first.** The OpenAPI spec is the contract. Web, and later iOS/Android, all consume the same API. No client-specific endpoints.
2. **Build only what Maki is differentiated on — buy the rest.** See §8 (Build) and §9 (Buy).
3. **Ship one thing at a time.** Each phase must be deployable and testable before the next starts.
4. **Test at the level of the risk.** Unit for pure logic, integration for handlers, E2E for user journeys, contract tests for the API shape across clients.
5. **Keep the plan under 1000 lines.** When this grows, split it by phase.
6. **Platform parity is tracked explicitly.** When mobile arrives, a feature matrix (`docs/feature-matrix.md`) documents what's on web vs. iOS vs. Android. Never let platforms drift silently.

---

## 2. Functional building blocks

These are the *functional* blocks of the product, independent of how we implement them. Each has a clear input, output, and owner.

| # | Block | What it does | Build or Buy (v1) |
|---|---|---|---|
| B1 | **Marketing site** | Editorial pages: Compound / Stays / Days / Guide. Trilingual. SEO. Ambient video + Matterport embeds. | Build |
| B2 | **Availability engine** | Single source of truth for calendar, rates, min-night, seasonal rules, LOS discounts, orphan-gap auto-discount. | Build (thin layer) over (Buy) channel manager |
| B3 | **Booking / checkout** | Rate display with all-in pricing (incl. Saneamiento), date hold, deposit (30%) + balance (70%), cancellation tiers. | Build |
| B4 | **Payments** | Stripe (primary) + MercadoPago (MX-domestic) + Klarna for shoulder. | Buy |
| B5 | **Channel sync** | Push availability/rates to Airbnb / Booking / VRBO; pull their bookings back. Direct is source of truth. | Buy (Hostaway or Hospitable) |
| B6 | **Guest identity** | Magic-link primary, optional password, JWT access + refresh tokens. Works for web + native. | Build (thin) |
| B7 | **Guest verification** | ID check + damage waiver instead of refundable hold. | Buy (Truvi/Superhog) |
| B8 | **Mexican compliance** | FMM guest registration. | Buy (Chekin) |
| B9 | **Pre-arrival guest PWA** | Boarding pass: lock code, WiFi, guide, chat, upsells. | Buy (Enso Connect) or thin Build wrapper |
| B10 | **Messaging** | WhatsApp Business primary, email secondary, transactional templates. | Buy (Twilio or Bookboost for WA API) + Postmark/Brevo for email |
| B11 | **Review aggregator** | Pull Airbnb / Google / TripAdvisor reviews with source + freshness. | Buy (Revyoos) |
| B12 | **Housekeeping ops** | Turnover checklist, photo proof, supply flags. | Buy (Breezeway or Hostaway native) |
| B13 | **Maintenance tickets** | Ticket + photo, contractor-scoped access. | Buy (Breezeway) |
| B14 | **Smart lock** | Per-stay code, released day-of. | Buy (Igloohome or August, integrated via B5) |
| B15 | **Content CMS** | Edit `/guide/*` and `Stays` pages without deploying. | Build (lightweight MDX or Sanity free tier) |
| B16 | **Owner dashboard** | Weekly revenue + 30-day occupancy + 3 action items. | Build (thin — aggregates from B5/B4/B2 APIs) |
| B17 | **Retention loop** | Post-stay sequence, returning-guest offer, magic-link rebook. This is the north-star feature. | Build |
| B18 | **Analytics** | North-star (repeat-direct rate) + supporting metrics. | Buy (Plausible + Postgres queries) |
| B19 | **Notifications service** | Fan-out: booking events → email/WA/admin alerts. | Build (thin) |
| B20 | **Admin console** | Internal CMS + role management + audit log. Covers roles not served by Hostaway/Breezeway. | Build (minimal) |

**Rule:** we only build B1, B2, B3, B6, B15, B16, B17, B19, B20. All the rest are contracted-out services reached via an adapter layer (§5).

---

## 3. Lean architecture

A **small TypeScript monorepo** with a clean API boundary, so native apps later plug into the same backend.

```
maki-tulum/
├── apps/
│   ├── web/                 # Next.js 15 (App Router, React 19) — public marketing + booking + guest account
│   └── admin/               # Next.js 15 admin app — owner / manager / housekeeping / maintenance
│                            # Deployed to admin.makitulum.com behind Cloudflare Access (ADR 0010)
├── services/
│   └── api/                 # Hono on Node 22 — REST + WebSocket (chat presence)
├── packages/
│   ├── types/               # Zod schemas + inferred TS types; generated OpenAPI client
│   ├── ui/                  # Design system (React + Tailwind v4), portable to React Native later
│   ├── i18n/                # Locale JSON (en, es, de) + shared keys
│   └── config/              # Shared env validation, logger, constants
├── infra/
│   ├── railway/             # railway.toml per service
│   └── docker/              # dev docker-compose (Postgres + Redis)
├── scripts/
│   ├── seed.ts              # Seed dev DB with obviously-fake data (@example.test)
│   ├── sync-i18n.ts         # Sync shared i18n keys to future mobile apps
│   └── check-env.ts         # Pre-deploy env var audit
├── docs/
│   ├── feature-matrix.md    # Per-feature status across web / iOS / Android
│   ├── adrs/                # Architecture decisions (one .md each)
│   └── runbooks/            # On-call playbooks (when we have them)
├── idea-v3.md               # Product thesis (do not edit casually)
├── implementation-plan.md   # This file
└── CLAUDE.md                # AI agent orientation
```

### 3.1 Stack choices

| Layer | Choice | Why |
|---|---|---|
| API | **Hono on Node 22** | Fastest Node framework, OpenAPI-friendly via `@hono/zod-openapi`, runs on Railway without config, TypeScript end-to-end keeps types shared with web/mobile |
| DB | **PostgreSQL 16** (Railway-managed) | Proven, single-region (Railway `us-west-1`) — Tulum traffic is global but low-volume, latency is fine |
| Cache / queue | **Redis** (Railway addon) | Sessions, rate-limit counters, BullMQ job queue for outbound notifications |
| Web | **Next.js 15 / React 19** | App Router for SSR + locale routing, Server Actions for simple mutations |
| Styling | **Tailwind v4 + CSS variables** for the palette | Palette lives in one `tokens.css`; components are portable to React Native via NativeWind later |
| Auth | **Custom JWT — short-lived access (15 min) + rotating refresh tokens** | Works for web (httpOnly cookies) and native (secure storage) from one API. Lesson: don't put JWT in localStorage |
| State (web) | **Zustand** + React Query v5 | Zustand for UI state, React Query for server state with `refetchOnWindowFocus: true` (lesson learned) |
| Email + WhatsApp | **Brevo** (ADR 0012) | One vendor for both channels — avoids stitching together Postmark + Twilio + a separate SMS vendor |
| Analytics | **Plausible** (marketing) + Postgres views (business metrics) | No GDPR cookie banner required |
| Error / obs | **Sentry** free tier | Errors + a few custom spans for the booking flow |
| CI | **GitHub Actions** | Lint, typecheck, test, build, deploy on merge |

### 3.2 Why Hono / TypeScript, not Go

Civion used Go successfully — we're choosing TS here because:
- **Type-sharing with clients** matters more than raw throughput at this scale (10–200 bookings/mo).
- One language across api + web + scripts = smaller cognitive surface for a solo/small team.
- Hono scales fine to the volume we need; if we ever need Go, the OpenAPI spec makes the rewrite low-risk.

### 3.3 Admin app

**Decision (ADR 0010, supersedes earlier guidance):** admin lives in a **separate Next.js app** (`apps/admin`) deployed to a **separate Railway service** at the **separate subdomain `admin.makitulum.com`**, fronted by **Cloudflare Access**. The public site (`apps/web`) does not serve any admin routes and ships no admin code. Reason: prior project at the same domain ate sustained malicious traffic at predictable admin paths; ZTNA + subdomain isolation gives meaningful defense in depth with ~30 min of one-time setup.

### 3.4 API design rules

- **OpenAPI is the contract.** Written with `@hono/zod-openapi` so the spec is generated from the handler code, not maintained separately.
- **All responses use a consistent envelope** — `{ data, meta, pagination? }`. Lesson from Civion: inconsistent envelopes silently break clients.
- **Status enums defined once** in `packages/types` and re-exported to clients. Never let one client transform an enum value; find the mismatch at the source.
- **Every response sets `Content-Type: application/json` explicitly.** Never use raw `throw new Error()` → JSON. Errors serialize to `{ error: { code, message, details? } }`.
- **All list endpoints are paginated** (default 20, max 100) and return `meta.total`.
- **Idempotency keys** required on POSTs that create money-moving side effects (booking, refund, payment).

### 3.5 Multi-tenancy (light)

We have one tenant (Maki) — but we design tenant-scoped from the start so the same backend could host a second compound later without a rewrite. Every row has `account_id`, every query filters explicitly (`WHERE account_id = $1`). No Postgres RLS dependency — Civion learned RLS is bypassable via the default role; we treat RLS as defense-in-depth only.

### 3.6 Mobile-readiness

The web-only v1 still makes three structural choices that unlock native later with minimal cost:

1. **API is purely REST + JWT** — no Next.js-specific session cookies on API routes. Web wraps JWT in an httpOnly cookie; native stores JWT in Keychain/Keystore. The API doesn't know the difference.
2. **UI tokens (colors, spacing, type scale) live in `packages/ui/tokens.ts`** as plain JS — consumable by Tailwind today and by React Native / SwiftUI / Compose tomorrow (via a small export script).
3. **i18n keys live in `packages/i18n`** with a sync script that'll copy shared keys into `apps/ios/Localizations` and `apps/android/res/values*/strings.xml` when those apps exist. (Pattern from Civion's `scripts/sync-i18n.py`.)

### 3.7 Data model (logical — not DDL)

- **Accounts** own a set of Properties. One account for Maki today.
- **Properties** are individual villas/apartments in the compound. Each has rates, photos, amenities, unit metadata.
- **Users** are guests, owners, managers, housekeepers, contractors, admins. One account may have many.
- **Roles** are attached to a User within an Account context (`account_memberships`).
- **Bookings** link a Guest → Property → date range, with channel (`direct` / `airbnb` / `booking` / `vrbo`), status, money breakdown (base / cleaning / saneamiento / total), payment state.
- **Payments** track one or many captures against a Booking (deposit, balance, refund).
- **Calendar blocks** cover owner personal-use, maintenance, or channel-imported holds.
- **Reviews** are sourced (`airbnb` / `google` / `tripadvisor` / `direct`) and cached with freshness.
- **Content** — `stays`, `guide_articles`, `bundles`, per-locale translations (no temporal versioning in v1 — lesson from Civion).
- **Messages** — a thread-per-booking, multi-channel (whatsapp/email/in-app), with `sent_at`, `delivered_at`, `read_at`.
- **Audit log** — append-only, partitioned monthly (not needed v1, design for it).

Exact schema lives in `services/api/migrations/` once we start. This logical model stays stable.

---

## 4. Phases & scope

Six phases. Each ends with a deployable build and a validation gate.

### Phase 0 — Foundations (Week 1)
**Goal:** repo, CI, Railway, dev env, docs skeleton.

- Monorepo with pnpm workspaces + Turbo.
- `apps/web` boots a placeholder home page + `/healthz`.
- `services/api` boots Hono with `/healthz`, `/readyz`, CORS, rate limiter, Zod request validation, OpenAPI route.
- Postgres + Redis in Railway staging. Migrations via **drizzle-kit** (ADR 0011).
- GitHub Actions: lint, typecheck, unit tests, build, deploy-to-Railway-preview on PR.
- Sentry wired up. Plausible wired up.
- **Exit criterion:** `https://maki-staging.up.railway.app/healthz` returns 200; PR previews deploy.

#### Phase 0 workstreams

Phase 0 is where we reduce future rework. It is not "just scaffolding." If we get this wrong, every later phase inherits the cost.

**P0.1 Repo bootstrap**
- Create root `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `.nvmrc`, `.tool-versions` if needed.
- Pin Node 22 and pnpm in `packageManager`.
- Create base scripts: `dev`, `build`, `lint`, `typecheck`, `test`, `test:unit`, `test:integration`, `check-env`.
- Add root `.env.example` with only non-secret placeholders and comments.

**P0.2 Web skeleton**
- Create `apps/web` on Next.js App Router.
- Add `/` placeholder page with project identity and environment banner.
- Add `/healthz` route that returns `200` JSON with app name, git SHA if available, and timestamp.
- Add a smoke layout with i18n-ready folder structure, but do not implement marketing pages yet.

**P0.3 API skeleton**
- Create `services/api` on Hono + Node adapter.
- Add `/healthz` and `/readyz`.
- Add top-level middleware for request ID, CORS, JSON error envelope, body-size limit, and rate limiting.
- Add OpenAPI doc route and one trivial typed route so spec generation is exercised from day one.
- Add env validation at process boot; app should fail fast on invalid config.

**P0.4 Shared packages**
- `packages/types`: shared envelopes, health response schema, common enums, and OpenAPI-generated client placeholder.
- `packages/config`: env parsing, logger wrapper, constants, `sanitizeText`.
- `packages/i18n`: bootstrap locale keys for `en`, `es`, `de`.
- `packages/ui`: minimal token package only; no premature component library.

**P0.5 Local infrastructure**
- `infra/docker/docker-compose.yml` for Postgres 16 + Redis 7.
- One command to boot infra locally and one to tear it down cleanly.
- API `.env` defaults point at Docker services, not Railway.
- Add first migration runner and a no-op initial migration so the migration path is tested before Phase 1.

**P0.6 CI/CD**
- GitHub Actions workflows for install, lint, typecheck, unit tests, integration tests, build.
- Cache pnpm store and Turbo artifacts conservatively.
- Add Railway deployment workflow or GitHub integration path, plus preview smoke step that hits `/healthz`.
- Ensure failures are legible: separate jobs for `web`, `api`, and shared packages if needed.

**P0.7 Observability and analytics**
- Wire Sentry in disabled-or-low-sample mode for non-production so integration itself is verified without noisy data.
- Wire Plausible only in web, behind env guards, with no custom events yet.
- Add structured request logging on API with request ID and latency.

**P0.8 Documentation and decision capture**
- Write the foundational ADRs that would otherwise be rediscovered later.
- Update `docs/feature-matrix.md`, `docs/backlog/TODO.MD`, and `CLAUDE.md` in the same commit as any Phase 0 implementation work.
- Add a short `docs/runbooks/local-dev.md` if local setup requires more than `pnpm install` + `pnpm dev:up`.

#### Phase 0 ordering

Work should happen in this order:

1. Repo bootstrap and package manager setup
2. Web and API skeletons with health routes
3. Shared package extraction
4. Local Docker infra and migration path
5. CI jobs
6. Railway staging environment
7. Sentry/Plausible wiring
8. ADRs and docs cleanup

This order matters because it keeps feedback loops short. We want local boot before CI, and CI before Railway.

#### Phase 0 test plan

Phase 0 still needs real tests. The right question is not "does scaffolding have tests?" but "what failures become expensive if we do not catch them now?"

**Unit tests**
- `packages/config/env.ts` rejects missing and malformed env vars.
- `sanitizeText()` strips disallowed HTML and preserves normal text.
- Shared response-envelope helpers always serialize the expected shape.
- Health-schema Zod contracts parse valid payloads and reject drift.

**Component tests**
- `apps/web` root page renders without crashing.
- `/healthz` route handler returns JSON with the expected shape.
- Any shared provider tree mounts cleanly in the App Router.

**API integration tests**
- `GET /healthz` returns `200`, JSON, and expected envelope or health shape.
- `GET /readyz` returns non-200 when Postgres/Redis are unavailable and `200` when both are reachable.
- CORS allowlist behaves differently in test vs. production env fixtures.
- Rate limiter returns JSON `429` responses, not text/plain or HTML.
- OpenAPI document route responds and contains at least one typed path.

**Infra tests**
- Docker Compose boots Postgres and Redis locally.
- Migration command runs successfully against fresh local Postgres.
- API can connect to local Postgres and Redis from integration tests.

**CI tests**
- Fresh checkout passes `pnpm install --frozen-lockfile`.
- `turbo run lint typecheck test build` succeeds in CI.
- Preview/staging smoke test performs HTTP GET against deployed `/healthz`.
- `scripts/check-env.ts` fails the build when a required env var is missing.

**Manual verification**
- Railway service is listening on `0.0.0.0:$PORT`.
- Railway healthcheck path is configured and returning `200`.
- Preview deployments are isolated from staging data.
- Sentry receives one intentional test event in staging.
- Plausible script loads only when the public env var is present.

#### Phase 0 acceptance criteria

Phase 0 is done only when all of these are true:

- A new developer can clone the repo, run `pnpm install`, `pnpm dev:up`, and `pnpm dev`, and get both `web` and `api` running locally.
- `web` and `api` both expose working `/healthz` routes locally and on Railway staging.
- API integration tests run against real Postgres and Redis, not mocks.
- OpenAPI generation is exercised in CI.
- At least one ADR is written for each irreversible Phase 0 decision cluster: stack, repo structure, deploy target, auth strategy, data isolation.
- CI is green on a clean branch with no manual steps.
- `docs/backlog/TODO.MD`, `docs/feature-matrix.md`, and `CLAUDE.md` reflect the actual repo state.

#### Phase 0 decisions we should lock during execution

These decisions should be made during Phase 0, not deferred indefinitely:

- **Railway-managed Postgres/Redis** for initial staging, unless a hard blocker appears during setup.
- **`apps/web` only** for Phase 0; `apps/admin` lands at Phase 3 kickoff per ADR 0010.
- **MDX-first content direction** as the default CMS placeholder, unless editorial workflow requirements immediately invalidate it.
- **Railway PR environments** preferred over custom preview scripting if GitHub integration is sufficient.

#### Phase 0 anti-scope

Things that look adjacent but should not enter Week 1:

- real booking domain models
- auth flows beyond env/schema groundwork
- design system expansion beyond tokens
- content modeling for all pages
- any third-party hospitality vendor integration
- any production DNS cutover

If we touch those in Phase 0, we are leaking later-phase complexity into the foundation week.

### Phase 1 — Public marketing site (Weeks 2–4)
**Goal:** a trilingual, story-first site with brand polish. No booking yet.

- Layout system + design tokens (palette, type scale).
- Pages: Home, The Compound, The Days, each Stay (stub data), Guide index, Guide articles (MDX).
- `/en/*`, `/es/*`, `/de/*` with hreflang.
- Ambient video hero (WebM, poster fallback).
- Navigation: Compound / Stays / Days / Guide / Book (Book = `/book` placeholder).
- Schema.org `LodgingBusiness` + `Hotel` + `HotelRoom` on relevant pages.
- Cookie banner only for non-essential cookies (Plausible is cookieless by default).
- **Exit criterion:** Lighthouse score ≥90 all categories on home + 2 stays + 1 guide article; all copy in 3 languages; brand review signed off.

### Phase 2 — Availability + booking (Weeks 5–8)
**Goal:** an honest, end-to-end direct booking with test payments.

- API: `properties`, `availability`, `rates`, `bookings`, `quotes` endpoints.
- Rate engine: seasonal tables, min-night, LOS discounts, orphan-gap auto-discount logic.
- Quote endpoint returns an itemized breakdown (base, cleaning, Saneamiento, total, FX note) — this is the "radical fee transparency" requirement from the thesis.
- Booking flow: dates → quote → guest details → Stripe test → deposit capture → confirmation.
- 30% deposit at booking, scheduled capture of 70% at T-30 days (Stripe PaymentIntent with `capture_method: manual` + BullMQ job).
- Tiered cancellation wired up (flex / standard / non-refundable).
- Magic-link email confirmation (no account required at book-time).
- **Exit criterion:** end-to-end test booking on staging with Stripe test card; balance capture scheduled job runs and completes; Saneamiento appears on the quote page.

### Phase 3 — Accounts, dashboard, channel manager (Weeks 9–12)
**Goal:** Hostaway sync live + basic owner dashboard + admin console.

- Auth: magic link primary; password optional. Short-lived access + rotating refresh tokens. httpOnly cookies on web.
- Guest area: my bookings, rebook, update details.
- Hostaway integration: push availability/rates outward; ingest OTA bookings inward into our Postgres. Our DB is source of truth; Hostaway is a gateway.
- Owner dashboard at `admin.makitulum.com` (separate `apps/admin` app, behind Cloudflare Access — see ADR 0010) — weekly revenue, 30-day occupancy, 3 action items.
- Admin console: role management, content edit (Stays + Guide MDX), audit log read.
- Review aggregator (Revyoos) embed on Stays pages.
- **Exit criterion:** a booking made on Airbnb sandbox appears in our Postgres within 5 minutes; owner dashboard shows correct numbers; first real direct booking possible end-to-end on production.

### Phase 4 — Guest experience (Weeks 13–16)
**Goal:** retention loop + guest PWA + WhatsApp.

- Pre-arrival boarding pass (own implementation or Enso Connect embed — decide based on Enso pricing).
- WhatsApp Business integration — inbound + outbound templates for: booking confirm, balance due, 7-day reminder with guide link, arrival day, departure day, 3-week post-stay.
- Smart lock: per-stay code, released 24h before arrival.
- Upsell catalogue (chef, cenote, yoga, transfer) surfaced on rate page *and* on the boarding pass.
- Post-stay review prompt + private feedback form.
- Returning-guest offer: magic-link rebook with last-stay context pre-filled.
- **Exit criterion:** a test guest journey from booking to post-stay completes with 8 expected WhatsApp touchpoints fired; rebook link works.

### Phase 5 — Three-bet immersion (Weeks 17–20)
**Goal:** the three v1 UX bets from the thesis.

- Matterport walkthroughs embedded on each Stay page.
- Ambient video production + placement (hero, mid-page transitions).
- Soft 24-hour no-card date-hold mechanism: exit-intent on booking page → form → hold row in DB with 24h TTL → reminder email → expiry.
- **Exit criterion:** three bets live; CTR from hold-form to paid booking tracked.

### Phase 6 — Retention depth + polish (Weeks 21+)
**Goal:** make trip #2 the obvious choice.

- Repeat-guest login + remembered preferences.
- Bundle builder on rate page (not just post-booking upsell).
- Interactive compound SVG map with per-villa availability.
- Retreat / multi-unit quote form (3+ units → manual quote).
- Cart-abandonment recovery (email + WhatsApp with consent).
- Carbon-offset opt-in per booking.
- "We are not for everyone" + Accessibility pages.
- **Exit criterion:** north-star metric (% of eligible repeat guests who rebook direct) measurable; first direct rebook shipped.

### Explicit non-goals (v1)

- AI concierge that transacts. Not now.
- Mobile apps. Not until web is profitable + the same API is stable.
- Multi-account (second compound). Schema supports it; we don't build the UI for it.
- Loyalty points / gamified tiers.
- Any custom channel-sync engine (Hostaway does this).

---

## 5. The adapter layer (what "buy" actually means in code)

Every external service sits behind an interface in `services/api/src/adapters/`. One file per vendor, one interface per capability. This way:

- Tests inject fakes.
- Swapping Hostaway → Hospitable is a one-file change.
- New platforms (mobile) don't need to know which vendor we use.

```
services/api/src/adapters/
├── channel-manager/
│   ├── index.ts          # export type ChannelManager { pushAvailability, listBookings, ... }
│   ├── hostaway.ts       # Hostaway implementation
│   └── fake.ts           # In-memory fake for tests
├── payments/
│   ├── index.ts          # export type PaymentProcessor
│   ├── stripe.ts
│   └── fake.ts
├── messaging/
│   ├── whatsapp/
│   └── email/
├── verification/
│   └── truvi.ts
├── housekeeping/
│   └── breezeway.ts
└── reviews/
    └── revyoos.ts
```

**Rule:** handler code never imports a vendor SDK directly. Only the adapter does.

---

## 6. Deployment on Railway

Maki will live as a single Railway project with four services:

| Service | Type | Env vars (key ones) |
|---|---|---|
| `web` | Dockerfile (Next.js standalone) | `NEXT_PUBLIC_API_URL` (**build arg**), `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`, `SENTRY_DSN` |
| `api` | Dockerfile (Node 22 + Hono) | `DATABASE_URL`, `REDIS_URL`, `JWT_PRIVATE_KEY`, `STRIPE_SECRET_KEY`, `HOSTAWAY_*`, `BREVO_API_KEY`, `CORS_ORIGINS`, `APP_ENV` |
| `postgres` | Railway-managed Postgres | — |
| `redis` | Railway-managed Redis | — |

### Environments
- **staging** — auto-deploys from `main`, all test credentials, own domain `staging.makitulum.com`.
- **production** — manually promoted (or auto after staging smoke tests pass), `makitulum.com`.
- **PR previews** — Railway spins up a preview per PR; seed data only, isolated Postgres via Railway preview feature.

### Railway-specific guardrails (from Civion lessons)

1. **`NEXT_PUBLIC_*` values must be present at Next.js build time.** In Railway, service variables are available during both build and runtime, but browser-exposed `NEXT_PUBLIC_*` values are baked into the client bundle at build. We can pass them through normal Railway service variables or explicit Docker build args; the important rule is that changing them requires a rebuild/redeploy.
2. **Healthcheck path must exist.** `/healthz` is an actual Next.js route and an actual Hono route. Both return 200 with a small JSON. Railway's healthcheck config points at them explicitly.
3. **`railway up --detach` returns before the build finishes.** CI always runs `railway logs` afterward and verifies a success marker, otherwise the pipeline is red.
4. **`railway link` must point at the project root, not `~`.** CI runs from the repo root; dev CLAUDE.md reminds human operators.
5. **Env var names match code exactly.** A pre-deploy script (`scripts/check-env.ts`) greps the codebase for `process.env.X` and compares against a `required-env.json` manifest; missing keys fail the deploy.
6. **No `localhost` in production CORS allowlist.** `CORS_ORIGINS` is env-scoped; production excludes local origins entirely.
7. **Docker base images pinned by SHA digest.** Never `node:22-alpine`, always `node:22-alpine@sha256:...`. Dependabot-bumped.
8. **Healthcheck and readycheck are different.** `/healthz` = process is up. `/readyz` = DB + Redis reachable. Railway uses `/healthz`; uptime monitoring polls `/readyz`.

### Secrets & rotation
- All secrets live in Railway. Never in the repo.
- JWT signing keys rotate yearly; refresh tokens survive rotation via a `kid` claim.
- Stripe webhook secret per environment (staging webhook ≠ prod webhook).

### Domain & DNS
- Apex `makitulum.com` → web service.
- `api.makitulum.com` → api service.
- `staging.makitulum.com` + `api.staging.makitulum.com` for staging.
- Email via a subdomain (`mail.makitulum.com`) with SPF/DKIM/DMARC configured.

---

## 7. Testing framework

Five layers, each with a clear job. We do not write tests in layers that don't give us signal.

### 7.1 Unit tests — **Vitest**
**Where:** any pure function, rate calculation, date math, Zod schemas, utility code.
**Speed:** milliseconds. **Parallelism:** full.
**Examples:**
- `priceQuote(rate, dates, rules)` returns correct total incl. Saneamiento.
- `orphanGapDiscount(calendar, proposedDates)` returns correct % off.
- `minNightsForSeason(date)` returns correct policy.
- All Zod schemas round-trip (encode → decode).

**Rules:**
- No I/O in unit tests. Ever.
- Table-driven where the input space is enumerable (Civion pattern).
- Seed time with a fixed `Date` via `vi.setSystemTime`.

### 7.2 Component tests — **Vitest + React Testing Library + Playwright-CT** (for harder components)
**Where:** UI components in `packages/ui` and `apps/web/components`.
**Focus:** behavior, not implementation. Accessibility first.
**Rules:**
- **`afterEach(cleanup)` is mandatory.** RTL + Vitest doesn't auto-clean; missing it causes "multiple elements found" flakes (Civion lesson).
- Never query by class names. Use role / label / testid in that order.
- Every interactive component has a minimum-touch-target test (44×44px, from Civion a11y lesson).
- All form inputs tested at `text-base` (16px) to avoid iOS Safari zoom-on-focus.

### 7.3 Integration tests — **Vitest + Testcontainers** (ephemeral Postgres + Redis)
**Where:** API handlers against a real Postgres.
**Why:** Civion explicitly learned: mocked DBs hide real bugs (RLS, trigger, transaction scoping). We use real Postgres.
**Examples:**
- `POST /bookings` with valid payload creates rows in `bookings` + `payments` and triggers a WhatsApp template.
- `POST /bookings` twice with the same idempotency key returns the same booking, does NOT double-charge. (Civion XP-replay lesson generalized.)
- Rate-limit middleware returns 429 with `Content-Type: application/json` (not text/plain — Civion lesson).
- All `SET LOCAL` / tenant-context assertions run inside a transaction (not applicable for us, but test helper enforces it for future multi-tenant).

**Rules:**
- Testcontainers Postgres boots fresh per test file. Migrations applied once.
- Unique test data per run — emails are `test+${nanoid()}@example.test` (RFC 2606 reserved domain, Civion lesson).
- Rate limiter has a test-mode allowlist so rapid test traffic doesn't 429 itself (Civion lesson).

### 7.4 Contract tests — **openapi-response-validator + OpenAPI spec**
**Where:** every API response in integration tests is validated against the published OpenAPI schema.
**Why:** prevents silent drift between handler, spec, and client. A response with a changed enum or missing field fails immediately. This is the mechanism that keeps web and future mobile in sync.

### 7.5 End-to-end tests — **Playwright**
**Where:** `apps/web` against a deployed Railway preview.
**Scope:** the critical user journeys. We do NOT test every permutation.

Golden journeys:
1. Guest books a villa end-to-end with a Stripe test card.
2. Guest holds dates with no card (soft 24h hold) → receives email.
3. Owner views dashboard with correct weekly revenue.
4. Admin edits a Stay page copy → change appears on public site.
5. Language switch (EN → DE) preserves navigation state and URL.
6. Booking confirmation page is screen-reader accessible (axe-core assertion).

**Rules:**
- Tests generate unique emails per run (Civion lesson).
- Tests tolerate rate-limit 429s with backoff (Civion lesson).
- Every P0/P1 bug fix gets a Playwright regression test. No fix ships without one (Civion lesson).

### 7.6 Persona-based UAT (post-v1)
Adopted from Civion: AI-driven personas probing the site for a11y, security, i18n, and UX issues. Introduced at the end of Phase 3. Personas include:
- **Maria** — couple from Berlin, German-first, low mobile data connection.
- **Tom** — US guest on iOS Safari, screen reader.
- **Elena** — MX-domestic guest paying with OXXO.
- **Red team** — adversarial, probes auth, idempotency, tenant leak.

### 7.7 CI gates

Every PR must pass: lint → typecheck → unit → component → integration → build → preview deploy → smoke E2E.
Main must additionally pass: full E2E + contract tests + a `scripts/check-env.ts` audit.

---

## 8. Security & privacy (non-negotiable from day one)

Civion lessons baked in — these are not "later." They're cheap when built in and expensive to retrofit.

1. **JWT stored in httpOnly secure cookies on web; Keychain/Keystore on native.** Never localStorage (XSS exposure).
2. **Short-lived access tokens (15 min) + rotating refresh tokens.** A Redis-backed token denylist for immediate sign-out revocation.
3. **Rate limiting on every auth endpoint on day one.** Per-IP + per-endpoint. Login 20/hr, register 15/hr, forgot-password 10/hr, reset 5/hr.
4. **HTML-tag stripping on every user-supplied text field** at the API boundary. `sanitizeText()` in a shared util.
5. **All user text validated at the same constraints on every mutation endpoint.** (Civion had a Register vs. UpdateMe parity gap.)
6. **Explicit `WHERE account_id = $1` on every query.** No RLS dependency for isolation.
7. **Idempotency:** any endpoint with a non-idempotent side effect (payment, XP-like awards, WhatsApp send) must check current state before performing the side effect.
8. **Environment-scoped CORS.** Production excludes `localhost`.
9. **Content-Type `application/json` set explicitly on every JSON response.** No `res.status(500).send(string)` for JSON APIs.
10. **Obvious test data.** `@example.test` domain, placeholder names. Never realistic PII in seeds.
11. **Docker images pinned by SHA.**
12. **GDPR + Mexican LFPDPPP:** privacy policy, data retention schedule, explicit guest-data consent at checkout. Delete-on-request endpoint from day one.
13. **Audit log** on every role change, booking state change, refund, content edit.

---

## 9. Open decisions tracked here (not in idea-v3.md)

- Channel manager: **Hostaway** vs. Hospitable — get both trials, decide end of Phase 0.
- Guest PWA: **Enso Connect** vs. custom — decide start of Phase 4 after Enso pricing.
- ~~Email provider: Postmark vs. Brevo~~ **Decided (ADR 0012): Brevo** — email + WhatsApp under one vendor.
- DB host: Railway-managed Postgres vs. Neon. Railway-managed is simpler; Neon is cheaper at scale. Start Railway, migrate if we outgrow.
- ~~Admin UI: folded into `apps/web` under `/admin/*` or separate `apps/admin`. Default: folded.~~ **Decided (ADR 0010): separate `apps/admin` at `admin.makitulum.com` behind Cloudflare Access.**

---

## 10. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Double-booking via channel sync lag | Direct is source of truth. Push-based sync via Hostaway API (not iCal). Weekly integrity check compares our DB to each OTA. |
| Mexican tax rules change | Saneamiento and Visitax rates live in `packages/config/tax.ts` — one file edit, rebuild. |
| Stripe MX compliance | OXXO offered only on non-refundable rates. Refund/dispute rules documented and tested. |
| Solo maintainer fatigue | Every building block has a buy fallback. If the owner can't maintain, the business runs on Hostaway's native guest portal until a new dev is found. |
| Plan drift (lesson from Civion) | This file must be under 1000 lines. "Current state" updated every phase. Divergences logged in `docs/adrs/`. |
| German SEO moat never materializes | Validate DE search volume (Ahrefs / GSC) *before* Phase 1 DE content investment. If <100 MSV on target keywords, deprioritize DE copy. |

---

## 11. Timeline

A solo dev with AI assistance. Calendar weeks, not engineering weeks — realistic.

- **Week 1:** Phase 0
- **Weeks 2–4:** Phase 1 (marketing site)
- **Weeks 5–8:** Phase 2 (booking)
- **Weeks 9–12:** Phase 3 (accounts + channel + dashboards)
- **Weeks 13–16:** Phase 4 (guest experience + retention loop)
- **Weeks 17–20:** Phase 5 (Matterport + ambient video + soft hold)
- **Week 21+:** Phase 6 (retention depth + polish)

Soft launch target: **end of Phase 3 (~Week 12)** with direct bookings live and OTA channels synced. Phases 4–6 run in parallel with real traffic.

---

## 12. Definition of done (per phase)

A phase is done when **all** are true:

- Features in scope pass E2E on staging.
- Contract tests pass against the OpenAPI spec.
- Accessibility score ≥90 on new pages (Lighthouse).
- All new user-text inputs are sanitized + validated server-side.
- Every P0/P1 bug from phase testing has a regression test in `apps/e2e/tests/`.
- `docs/feature-matrix.md` updated.
- `implementation-plan.md` "Current state" at top of this file updated.
- Changelog entry in `CHANGELOG.md`.

---

## Appendix — key decisions (ADR pointers)

These live as `docs/adrs/NNNN-slug.md`. One per decision.

1. TypeScript on the backend (Hono), not Go.
2. Monorepo with pnpm + Turbo.
3. Railway over Fly/Render/AWS.
4. Buy channel manager (Hostaway default), don't build.
5. Magic-link first, password optional (simpler UX, less support).
6. JWT in httpOnly cookies (web), not localStorage.
7. Tenant-scoped schema from day one (one account today, designed for N).
8. No Postgres RLS dependency for isolation.
9. OpenAPI spec via `@hono/zod-openapi` (generated, not hand-maintained).
10. Admin in a separate `apps/admin` Next.js app at `admin.makitulum.com`, behind Cloudflare Access (ADR 0010 — supersedes the earlier "fold under /admin" decision after Felix flagged real-world bot traffic on predictable admin URLs).
11. Drizzle ORM + drizzle-kit migrations (ADR 0011) — single schema source, end-to-end type safety, raw-SQL escape hatch.
