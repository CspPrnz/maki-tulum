# Maki Tulum — TODO

> **Purpose**: Central tracker for all pending work. New observations go on top as timestamped sections. Bigger initiatives get their own `.md` file and are linked from here. Items marked ✅ are done; items marked 🔄 are in progress; items marked ⏸ are deferred.
>
> **Referenced from**: [`implementation-plan.md`](../../implementation-plan.md) · [`CLAUDE.md`](../../CLAUDE.md)

---

## Status Overview (updated 2026-04-18)

| Area | State | Notes |
|------|-------|-------|
| **Product thesis** | 🟢 Locked | `idea-v3.md` — OTAs acquire, direct retains |
| **Implementation plan** | 🟢 Locked | `implementation-plan.md` — 6 phases, Phase 0 next |
| **Git repo** | 🟡 Initialized | `github.com/CspPrnz/maki-tulum` — remote set, first commit pending push |
| **Monorepo skeleton** | ⚪ Planned | Phase 0 |
| **CI/CD** | ⚪ Planned | Phase 0 — GitHub Actions + Railway PR previews |
| **Railway project** | ⚪ Planned | Phase 0 — services: web, api, postgres, redis |
| **Marketing site** | ⚪ Planned | Phase 1 — trilingual editorial, brand polish |
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
| Channel manager | Hostaway vs. Hospitable | Felix | End of Phase 0 |
| Email provider | Postmark vs. Brevo | Felix | Start of Phase 1 |
| Admin location | `/admin` inside `apps/web` vs. separate `apps/admin` | Felix | Phase 3 kickoff |
| DB host | Railway-managed Postgres vs. Neon | Felix | End of Phase 0 |
| Guest PWA | Enso Connect vs. custom | Felix | Start of Phase 4 |
| DE SEO investment | Proceed / defer based on Ahrefs volume | Felix | Before Phase 1 DE content |

---

## Backlog — Phase 0: Foundations

- [ ] Set up pnpm + Turbo monorepo
- [ ] `apps/web` placeholder with `/healthz`
- [ ] `services/api` with Hono, `/healthz`, `/readyz`, CORS, rate-limit, Zod request validation, OpenAPI route
- [ ] `packages/types`, `packages/ui`, `packages/i18n`, `packages/config`
- [ ] `infra/docker/docker-compose.yml` — Postgres 16 + Redis 7
- [ ] Railway project + services: `web`, `api`, `postgres`, `redis` (staging first)
- [ ] `NEXT_PUBLIC_*` wired as Docker build args (not runtime)
- [ ] `/healthz` paths verified in Railway healthcheck config
- [ ] GitHub Actions: lint, typecheck, unit, component, integration, build, deploy-preview
- [ ] Sentry + Plausible wired up
- [ ] `scripts/check-env.ts` baseline
- [ ] `docs/adrs/0001-typescript-backend.md` through `0010-admin-under-web.md` written

Full plan: [`../../implementation-plan.md`](../../implementation-plan.md) §4 Phase 0.

---

## Notes

- Every P0/P1 fix ships with a regression test. No exceptions.
- All commits go through CI. No direct pushes to `main`.
- TODO status is updated in the same commit as the feature it describes (lesson from Civion: TODOs drift when not part of the commit workflow).
