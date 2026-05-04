# Maki Tulum — TODO

> **Purpose**: Central tracker for all pending work. New observations go on top as timestamped sections. Bigger initiatives get their own `.md` file and are linked from here. Items marked ✅ are done; items marked 🔄 are in progress; items marked ⏸ are deferred.
>
> **Referenced from**: [`implementation-plan.md`](../../implementation-plan.md) · [`CLAUDE.md`](../../CLAUDE.md)

---

## Status Overview (updated 2026-05-04)

| Area | State | Notes |
|------|-------|-------|
| **Product thesis** | 🟢 Locked | `idea-v3.md` — OTAs acquire, direct retains |
| **Implementation plan** | 🟢 Locked | `implementation-plan.md` — 6 phases, Phase 0 execution detail added |
| **Git repo** | 🟢 Live | `github.com/CspPrnz/maki-tulum` — main pushed |
| **Monorepo skeleton** | 🟢 Scaffolded | pnpm + Turbo; apps/web, services/api, 4 packages |
| **API service** | 🟢 Scaffolded | Hono + Zod-OpenAPI; `/healthz`, `/readyz`, CORS, rate-limit, JSON envelope |
| **Web app** | 🟢 Scaffolded | Next.js 15 + Tailwind v4; `/healthz`, brand tokens; standalone Docker output |
| **CI** | 🟢 Wired | GitHub Actions: env audit · format · typecheck · lint · test · build (Postgres + Redis services) |
| **Local dev infra** | 🟢 Ready | docker-compose with Postgres 16 + Redis 7 |
| **ADRs** | 🟢 0001–0012 | 0004 paused; 0010 supersedes earlier admin plan; 0011 Drizzle; 0012 Brevo email |
| **Lockfile** | 🟢 Committed | `pnpm-lock.yaml` in main |
| **DB schema (Drizzle)** | ⚪ Pending | Install drizzle-orm + drizzle-kit, scaffold `services/api/src/db/`, first migration |
| **Railway project** | ⚪ Planned | Phase 0 — services: web, api, postgres, redis |
| **Admin app** | ⚪ Deferred | Phase 3 — separate `apps/admin` at admin.makitulum.com behind Cloudflare Access |
| **Marketing site (Phase 1A)** | 🟢 Scaffolded | Locale-segment routing, home + stays index + Villa 18 + Villa 19 + 4 stubs, schema.org, EN/ES/DE, 33 tests, full Next build green (9 routes, 6 SSG) |
| **Marketing site (Phase 1B)** | ⚪ Planned | Compound + Days + Guide content, ambient video hero, MDX guide articles, Lighthouse ≥90 sign-off |
| **Booking engine** | ⚪ Planned | Phase 2 — Stripe, Saneamiento transparency, deposit/balance split |
| **Accounts + dashboard** | ⚪ Planned | Phase 3 — Hostaway, magic-link auth, owner dashboard |
| **Guest experience** | ⚪ Planned | Phase 4 — WhatsApp, boarding pass, retention loop |
| **Three UX bets** | ⚪ Planned | Phase 5 — Matterport, ambient video, 24h soft hold |
| **Retention depth** | ⚪ Planned | Phase 6 — repeat-guest login, bundles, compound map |
| **iOS app** | ⚪ Deferred | Backend designed for native; ship web profitably first |
| **Android app** | ⚪ Deferred | Same as iOS |

Legend: 🟢 done · 🟡 in progress · 🔴 blocked · ⚪ planned · ⏸ deferred

---

## Open decisions (blocking Phase 0/1)

| Decision | Options | Owner | Due |
|---|---|---|---|
| Channel manager | ~~Hostaway vs. Hospitable~~ → **Hosthub vs. Hostaway** (paused, ADR 0004) | Felix | Phase 3 kickoff (don't pay until live) |
| ~~Email provider~~ | ~~Postmark vs. Brevo~~ — **decided** (ADR 0012): Brevo (multi-channel, EU-based) | Felix | ~~Start of Phase 1~~ ✅ |
| ~~Admin location~~ | ~~`/admin` vs. separate~~ — **decided** (ADR 0010): separate `apps/admin` at `admin.makitulum.com` behind Cloudflare Access | Felix | ~~Phase 3 kickoff~~ ✅ |
| DB host | Railway-managed Postgres vs. Neon | Felix | End of Phase 0 |
| Guest PWA | Enso Connect vs. custom | Felix | Start of Phase 4 |
| DE SEO investment | Proceed / defer based on Ahrefs volume | Felix | Before Phase 1 DE content |

---

## Backlog — Phase 0: Foundations

### Done

- [x] Set up pnpm + Turbo monorepo
- [x] Pin Node 22 and pnpm 9.12 in repo metadata (`engines`, `packageManager`, `.nvmrc`)
- [x] `apps/web` placeholder with `/healthz`
- [x] `services/api` with Hono, `/healthz`, `/readyz`, CORS, rate-limit, Zod request validation, OpenAPI route
- [x] `packages/types`, `packages/ui`, `packages/i18n`, `packages/config`
- [x] `infra/docker/docker-compose.yml` — Postgres 16 + Redis 7
- [x] `NEXT_PUBLIC_*` wired as Docker build args + documented in `infra/railway/README.md`
- [x] `/healthz` paths in Dockerfiles + railway.toml
- [x] GitHub Actions: env audit, format, typecheck, lint, test, build (with Postgres + Redis services)
- [x] `scripts/check-env.ts` + `scripts/sync-tokens.ts` baseline
- [x] ADRs 0001–0003 (TypeScript backend, monorepo, Railway)
- [x] ADRs 0004–0011 written: 0004 channel manager paused (Hosthub research notes), 0005 magic-link auth, 0006 JWT httpOnly cookies, 0007 tenant-scoped schema, 0008 no-RLS-dependency + defense-in-depth, 0009 OpenAPI from Zod, 0010 separate admin app behind Cloudflare Access (supersedes earlier plan), 0011 Drizzle ORM + drizzle-kit
- [x] ADR 0012 — Brevo as transactional email provider (Phase 1A)
- [x] **Phase 1A landed:** locale routing (`/en|es|de`), middleware + cookie persistence + locale switcher, brand tokens, `@maki/ui` primitives, home page, Stays index, Villa 18 + Villa 19 detail (real photos for 18, placeholders for 19), 4 stub pages, schema.org `LodgingBusiness` + `HotelRoom`, full content in 3 languages, 33 tests passing, Next.js production build green

### Remaining (next session — Felix-side)

- [ ] **Run `pnpm install`** with Node 22 + pnpm 9.12 → commit `pnpm-lock.yaml` (already done — verify on next clone)
- [ ] Install drizzle-orm + drizzle-kit + drizzle-zod (ADR 0011), scaffold `services/api/src/db/{schema.ts,index.ts,repositories/}` + `drizzle.config.ts` + `migrations/`, write first migration (e.g., `accounts` + `users` + `account_memberships`), apply against local Postgres, commit
- [ ] **Create Railway project** via dashboard or CLI; add 4 services (web, api, postgres, redis)
- [ ] Configure Railway: build vars (`NEXT_PUBLIC_*`), runtime env (`DATABASE_URL`, `REDIS_URL`, `JWT_*`, `CORS_ORIGINS`), healthcheck paths
- [ ] First PR preview deploy: verify `/healthz` returns 200 on staging URLs
- [ ] Integration tests for `/healthz`, `/readyz`, CORS, JSON error envelope, and rate-limit (use Testcontainers)
- [ ] Preview/staging smoke test hits deployed `/healthz`
- [ ] Sentry: create projects (web + api), add DSNs to Railway
- [ ] Plausible: register `staging.makitulum.com` and `makitulum.com`, add `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`
- [ ] DNS: point apex + `api.` + `staging.` to Railway
- [ ] **Phase 3 prep:** scaffold `apps/admin` (Next.js, separate Railway service, `admin.makitulum.com` domain) + Cloudflare Access app + policy (per ADR 0010)

### Phase 1B (next content pass — Felix-side, mostly content)

- [ ] Real photos + copy for Villa 19 (current placeholders)
- [ ] Photos + copy for Villas 1–17 + 20 as they come online (8 more units)
- [ ] Compound page real content (story, location context, design intent)
- [ ] Days page real content (mornings / days / nights routine, partners with names)
- [ ] Ambient video hero (placeholder MP4 + poster — Felix to provide source)
- [ ] MDX framework for `/guide/*` articles + 1 seed article (cenotes or beach clubs)
- [ ] Lighthouse audit on home + 1 stay + guide article — must hit ≥90 across all categories
- [ ] Cookie banner decision (Plausible is cookieless — Phase 1B may need none)
- [ ] German long-tail SEO validation (Ahrefs / GSC) before deeper DE content investment

### Phase 0 exit criterion

`https://maki-staging.up.railway.app/healthz` and `https://api.maki-staging.up.railway.app/healthz` both return 200; PR previews deploy automatically; CI green on main.

Full plan: [`../../implementation-plan.md`](../../implementation-plan.md) §4 Phase 0.

---

## Notes

- Every P0/P1 fix ships with a regression test. No exceptions.
- All commits go through CI. No direct pushes to `main`.
- TODO status is updated in the same commit as the feature it describes (lesson from Civion: TODOs drift when not part of the commit workflow).
