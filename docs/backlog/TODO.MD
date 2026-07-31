# Maki Tulum — TODO

> **Purpose**: Central tracker for all pending work. New observations go on top as timestamped sections. Bigger initiatives get their own `.md` file and are linked from here. Items marked ✅ are done; items marked 🔄 are in progress; items marked ⏸ are deferred.
>
> **Referenced from**: [`implementation-plan.md`](../../implementation-plan.md) · [`CLAUDE.md`](../../CLAUDE.md)

---

## Plans

Initiatives with more detail than fits a TODO line get their own file in `docs/backlog/plans/`:

- [`_template.md`](plans/_template.md) — the shape every plan file takes (parseable frontmatter, pinned contracts, file-ownership table, acceptance evidence).
- [`wp1-phase0-exit.md`](plans/wp1-phase0-exit.md) — **`in_progress`**. Streams A (persistence) and D (deploy/supply chain) landed; B (integration tests) and C (observability) in flight. Contracts C2 + C3 were corrected mid-flight after stream A caught them contradicting ADR 0007 and `packages/types`.
- [`consent-data-map.md`](plans/consent-data-map.md) — **`draft`**. Resolves MRT-15-P0-05: data map, lawful-basis matrix, retention design, 7 questions for counsel. Blocked on the legal-entity decision, which determines the controller.
- [`legal-entity-brief.md`](plans/legal-entity-brief.md) — **`draft`**. Resolves MRT-15-P0-04 into a decision-ready brief: constraint table, three options with tradeoffs, 9 questions to send counsel verbatim. Also separates FMM from the Quintana Roo lodging-reporting obligation (MRT-15-P1-05).
- [`channel-manager-capability-contract.md`](plans/channel-manager-capability-contract.md) — **`draft`**. Resolves MRT-15-P0-02/03 into 8 testable capability assertions + a sandbox acceptance plan. Finding: neither vendor's public docs answer the existential question (does unproxied guest contact reach us), so a sandbox trial is mandatory before selection.
- [`codex-red-team.md`](plans/codex-red-team.md) — running red-team log, `in_progress`. First pass (2026-07-15) logged 15 findings; see [Phase 2 blockers](#phase-2-blockers--codex-red-team-findings-2026-07-15) below.

---

## Status Overview (updated 2026-07-31)

| Area | State | Notes |
|------|-------|-------|
| **Product thesis** | 🟢 Locked | `idea-v3.md` — OTAs acquire, direct retains |
| **Implementation plan** | 🟢 Locked | `implementation-plan.md` — 6 phases, Phase 0 execution detail added |
| **Git repo** | 🟢 Live | `github.com/CspPrnz/maki-tulum` — main pushed |
| **Monorepo skeleton** | 🟢 Scaffolded | pnpm + Turbo; apps/web, services/api, 4 packages |
| **API service** | 🟢 Scaffolded | Hono + Zod-OpenAPI; `/healthz`, `/readyz`, CORS, rate-limit, JSON envelope |
| **Web app** | 🟢 Scaffolded | Next.js 15 + Tailwind v4; `/healthz`, brand tokens; standalone Docker output |
| **CI** | 🟢 Green | **First successful run in the repo's history, https://github.com/CspPrnz/maki-tulum/actions/runs/30639366657 (2026-07-31).** Was red on every run from Phase 0 until then: `check-env` failed at step 1, so nothing after it ever executed. Three separate false-greens had to be cleared — see lessons-learned. 97 tests now run on CI |
| **Local dev infra** | 🟢 Ready | docker-compose with Postgres 16 + Redis 7 |
| **ADRs** | 🟢 0001–0012, 0016 | 0004 paused; 0010 admin app; 0011 Drizzle; 0012 Brevo. **0016 (proposed)** replaces the unworkable T−30 manual-capture payment design |
| **Lockfile** | 🟢 Committed | `pnpm-lock.yaml` in main |
| **Agent harness** | 🟢 Landed | `AGENTS.md`, `CONTEXT.md`, `.claude/{settings.json,agents,skills}`, `pnpm verify`, plan template — see [Agent harness](#agent-harness-adopted-2026-07-31-from-innovation-factoryai-native-deliverymd) |
| **DB schema (Drizzle)** | 🟢 Landed | `0001_init`: accounts / users / account_memberships / properties + repositories. No booking/rate tables — blocked on MRT-15-P0-02 |
| **Railway project** | 🟢 Live | 4 services (web, api, Postgres, Redis) in project `inspiring-learning` (**needs renaming to maki-tulum**). https://web-production-66562.up.railway.app · https://api-production-b61ac.up.railway.app — both `/healthz` 200, api `/readyz` 200 with db+redis reachable, schema migrated |
| **Admin app** | ⚪ Deferred | Phase 3 — separate `apps/admin` at admin.makitulum.com behind Cloudflare Access |
| **Marketing site (Phase 1A)** | 🟢 Scaffolded | Locale-segment routing, home + stays index + Villa 18 + Villa 19 + 4 stubs, schema.org, EN/ES/DE, 33 tests, full Next build green (9 routes, 6 SSG) |
| **Marketing site (Phase 1B)** | 🟡 Mostly landed | Compound + Days + Guide content + first guide article shipped EN/ES/DE. Remaining: correct 5 `TODO(felix)` invented claims, Villa 19 photos, ambient video hero, Lighthouse ≥90 |
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
| Channel manager | **Hosthub vs. Hostaway** — **deferred again 2026-07-31 (Felix): not paying for a trial until it's needed.** Capability contract + sandbox plan are written and waiting ([`plans/channel-manager-capability-contract.md`](plans/channel-manager-capability-contract.md)). **Consequence: the Phase 2 availability/rates/inventory schema stays unfrozen** — MRT-15-P0-02 is deferred, not resolved | Felix | Before any inventory/availability schema work |
| ~~Email provider~~ | ~~Postmark vs. Brevo~~ — **decided** (ADR 0012): Brevo (multi-channel, EU-based) | Felix | ~~Start of Phase 1~~ ✅ |
| ~~Admin location~~ | ~~`/admin` vs. separate~~ — **decided** (ADR 0010): separate `apps/admin` at `admin.makitulum.com` behind Cloudflare Access | Felix | ~~Phase 3 kickoff~~ ✅ |
| DB host | Railway-managed Postgres vs. Neon | Felix | End of Phase 0 |
| Guest PWA | Enso Connect vs. custom | Felix | Start of Phase 4 |
| ~~DE SEO investment~~ | ~~Proceed / defer based on Ahrefs volume~~ — **decided (2026-07-15):** deprioritized. German is no longer a strategic ICP/acquisition bet (`idea-v3.md` revision note) — translations continue (EN canonical → DE, then others) but no dedicated DE growth investment | Felix | ~~Before Phase 1 DE content~~ ✅ |

## Open decisions (blocking Phase 2 — surfaced by Codex red-team, 2026-07-15)

Two `idea-v3.md` §15 items were labeled "open, before build" but not tracked in an operational table — Codex found they already constrain work Phase 2 is about to do. See [`plans/codex-red-team.md`](plans/codex-red-team.md) MRT-15-P0-04 and MRT-15-P0-05 for full detail.

| Decision | Why it can't stay deferred | Owner | Due |
|---|---|---|---|
| Legal entity + payments jurisdiction (`idea-v3.md` §15.8) | Determines merchant of record, Stripe account country, settlement currency, tax treatment, OXXO/MercadoPago eligibility — all committed in Phase 2's checkout design | Felix | Before Phase 2 checkout work starts |
| Guest-data consent scope (`idea-v3.md` §15.10, GDPR + LFPDPPP) | Phase 1A already persists locale preference; Phase 2 adds payment + guest records with no data map or lawful-basis matrix yet | Felix | Before Phase 2 booking schema is designed |

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
- [x] ~~Install drizzle-orm + drizzle-kit + drizzle-zod, scaffold `services/api/src/db/`, first migration~~ **Done 2026-07-31 (WP-1 stream A).** Verified against a real Postgres: 4 tables, account_id index + FKs, `membership_role` matching the canonical `Role` in `packages/types` with a drift-guard test
- [x] ~~Create Railway project; add 4 services~~ **Done 2026-07-31.** Project is named `inspiring-learning` — **Felix: rename to `maki-tulum`**
- [x] ~~Configure Railway: build vars, runtime env, healthcheck paths~~ **Done 2026-07-31.** `RAILWAY_DOCKERFILE_PATH` per service; healthcheck paths still to confirm in the dashboard
- [ ] PR preview environments — not configured; deploys are manual `railway up` for now
- [ ] 🔄 Integration tests for `/healthz`, `/readyz`, CORS, JSON error envelope, rate-limit, tenant isolation (Testcontainers) — WP-1 stream B in flight
- [x] ~~Staging smoke test hits deployed `/healthz`~~ **Done 2026-07-31** — `scripts/smoke.ts` passes against both services
- [ ] Sentry: create projects (web + api), add DSNs to Railway. **Scrub IPs before enabling** — see `plans/consent-data-map.md`
- [ ] Plausible: register `staging.makitulum.com` and `makitulum.com`, add `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`
- [ ] DNS: point apex + `api.` + `staging.` to Railway
- [ ] **Phase 3 prep:** scaffold `apps/admin` (Next.js, separate Railway service, `admin.makitulum.com` domain) + Cloudflare Access app + policy (per ADR 0010)

### Phase 1B (next content pass — Felix-side, mostly content)

- [ ] Real photos + copy for Villa 19 (current placeholders)
- [ ] Photos + copy for Villas 1–17 + 20 as they come online (8 more units)
- [x] ~~Compound page real content~~ **Done 2026-07-31 (WP-2)** — 5 invented claims marked `TODO(felix)` inline need Felix's correction before publish
- [x] ~~Days page real content~~ **Done 2026-07-31 (WP-2)** — partner names still absent; none were invented
- [ ] **Correct the 5 `TODO(felix)` invented claims** in compound/days/guide pages, then mirror the corrections into ES + DE
- [ ] Ambient video hero (placeholder MP4 + poster — Felix to provide source)
- [x] ~~Guide article framework + 1 seed article~~ **Done 2026-07-31 (WP-2)** — typed content modules, not MDX (no new dependency); `cenotes-near-aldea-zama` prerendered per locale
- [ ] Lighthouse audit on home + 1 stay + guide article — must hit ≥90 across all categories
- [ ] Cookie banner decision (Plausible is cookieless — Phase 1B may need none)
- [x] ~~Gate (Codex red-team MRT-15-P1-03, blocks Phase 1B): German long-tail SEO validation before deeper DE content investment~~ **Resolved 2026-07-15 — outcome: deprioritize.** Felix decided German is not a strategic ICP wedge (Maki serves international guests broadly; owners are themselves international) — no Ahrefs validation needed since the growth rationale for DE depth no longer exists. Translation work continues normally: EN is canonical source content, DE (then other languages) follow as straightforward translation, same priority as any other locale. See `idea-v3.md` revision note (2026-07-15) and §2/§13/§15.7.

### Phase 0 exit criterion — ✅ **MET 2026-07-31**

Both services return 200 on `/healthz` and the smoke test passes against each:

- web https://web-production-66562.up.railway.app/healthz → 200
- api https://api-production-b61ac.up.railway.app/healthz → 200, `/readyz` → 200 with `db: ok, redis: ok`
- schema migrated on Railway Postgres: 4 tables, canonical role enum, `users_email_lower_key`
- CI green on the PR; `STAGING_WEB_URL` / `STAGING_API_URL` repo variables set, so the post-deploy smoke job is now live rather than no-opping

Domains are Railway-generated, not `makitulum.com` — custom DNS is still outstanding, and PR preview environments are not configured. Neither blocks Phase 1B or Phase 2.

Full plan: [`../../implementation-plan.md`](../../implementation-plan.md) §4 Phase 0.

---

## Phase 2 blockers — Codex red-team findings (2026-07-15)

First adversarial pass against `idea-v3.md` + `implementation-plan.md` (see [`plans/codex-red-team.md`](plans/codex-red-team.md) for full problem/root-cause/test detail per finding — reviewed and accepted as sound). None of these block current work (Phase 0 remainder, Phase 1B content). MRT-15-P1-03 (German-content gate) resolved 2026-07-15 — see Phase 1B checklist above.

**Blocks Phase 2 — resolve before booking/checkout implementation:**

| ID | Finding | Objective |
|---|---|---|
| MRT-15-P0-01 | ~~T−30 manual capture can't survive a 7-day authorization window~~ | **Resolved 2026-07-31 → [ADR 0016](../adrs/0016-deposit-and-off-session-balance.md) (proposed).** Captured deposit + off-session balance charge, SCA recovery, dunning ladder, ledger as source of truth. Needs Felix's accept |
| MRT-15-P0-02 | Channel-manager selection deferred past the point it defines the availability/rates schema | **Still open — deliberately.** Felix deferred the vendor trial on cost grounds (2026-07-31). The [capability contract](plans/channel-manager-capability-contract.md) is written so the trial is cheap when it happens. **The finding stands:** any Phase 2 work that models availability, rates, or inventory is blocked until a vendor is validated. Booking work that does *not* touch inventory shape can proceed |
| MRT-15-P0-03 | "One-file adapter swap" understates how much vendor semantics shape checkout | **Resolved 2026-07-31** — 8 outcome-level assertions in the [capability contract](plans/channel-manager-capability-contract.md) |
| MRT-15-P0-04 | Legal entity/payments jurisdiction constrains Phase 2 checkout | **Decision-ready 2026-07-31** → [legal-entity-brief.md](plans/legal-entity-brief.md). Felix's decision + counsel |
| MRT-15-P0-05 | Consent scope open while Phase 2 expands data collection | **Decision-ready 2026-07-31** → [consent-data-map.md](plans/consent-data-map.md). Felix's decision + counsel |
| MRT-15-P1-01 | The north-star metric (`idea-v3.md` §12) has no defined cohort/identity/attribution model, and none of Hostaway/Breezeway/Enso own that graph | Define the metric's instrumentation contract in Phase 2, not Phase 6 |
| MRT-15-P1-02 | Phase 2/3 create direct-booking guests before Phase 4 builds the retention loop the thesis depends on | Move a minimum retention slice (consented contact, post-stay trigger, attributable rebook link) into Phase 2 |
| MRT-15-P1-05 | "Chekin handles FMM registration" conflates an immigration process with unidentified Quintana Roo lodging-reporting obligations | Get counsel's actual obligation list before validating a vendor against it |
| MRT-15-P1-06 | B2/B3 ("thin build over buy") is actually the operational core of the business — ownership isn't explicitly chosen | Explicitly choose bought-booking-engine-with-limits vs. custom-core-with-ownership-cost |
| MRT-15-P1-07 | No evidence the full EN/ES/DE + USD/EUR/MXN + WhatsApp journey is supported end-to-end across the vendor stack | Run a mandatory vendor acceptance test before contracts/production checkout work |
| MRT-15-P1-08 | Quote-integrity isn't a tested invariant, so the "no hidden fees" promise (`idea-v3.md` §14) can be silently violated downstream | Make the first displayed quote immutable end-to-end; test it as a cross-system money invariant |

**Worth a lessons-learned entry (logged in `docs/lessons-learned.md` Meta-lessons):**

| ID | Finding | Status |
|---|---|---|
| MRT-15-P2-01 | The Phase 5 no-card hold can leak inventory or become prohibited urgency theatre if shipped before channel-sync is proven | Open — don't ship the hold until inventory reserve/release is proven live; add anti-pattern copy checks to acceptance criteria |
| MRT-15-P2-02 | `implementation-plan.md` said "no code yet" while `CLAUDE.md`/TODO said Phase 1A shipped; ADR 0012 (Brevo) contradicted Postmark/Twilio mentions elsewhere (MRT-15-P1-04) | **Fixed this commit** — reconciled `implementation-plan.md` Current state + messaging stack references; docs/tasks→docs/backlog path fixups done as part of the same pass |

---

## Agent harness (adopted 2026-07-31 from `innovation-factory/ai-native-delivery.md`)

Felix asked for parallel-agent throughput, which pulls the orchestration protocol forward from its Phase-3 deferral. Landed this session — the nine-layer checklist from `ai-native-delivery.md` §7:

| Layer | Artifact | State |
|---|---|---|
| Rules | `CLAUDE.md` + `AGENTS.md` | 🟢 CLAUDE.md trimmed of history; AGENTS.md added as the vendor-neutral mirror (CLAUDE.md wins on conflict) |
| Domain | `CONTEXT.md` | 🟢 glossary seeded (Saneamiento, orphan gap, stay #2, vendor roles) |
| Skills | `.claude/skills/` | 🟢 `grill`, `orchestrate`, `handoff` |
| Subagents | `.claude/agents/` | 🟢 `worker` (sonnet, read/write), `verifier` + `security-reviewer` (opus, **no Edit/Write** — enforced by tool scoping) |
| Permissions | `.claude/settings.json` | 🟢 deny/ask/allow ladder, checked in |
| Hooks | Stop / PreToolUse | ⚪ **not wired** — deliberate. Revisit when we run unattended/auto-mode; `pnpm verify` is the gate it would close on |
| Backlog | `TODO.MD` + `plans/` | 🟢 `plans/_template.md` with parseable frontmatter added |
| Spec | per-WP plan file | 🟢 template in place; first real one is WP-1 |
| Handoff | `docs/handoff/` | 🟢 already in place since 2026-07-15 |
| Verify gate | `pnpm verify` | 🟢 `check-env · format:check · typecheck · lint · test · build` — mirrors CI exactly |

Still open:

- [ ] Wire a Stop-hook running `pnpm verify` — only once we actually run agents unattended. Must distinguish "couldn't run" from "found a regression" or it becomes a false-positive machine that gets disabled.
- [ ] CI drift check on plan-file frontmatter (`status:` vs. reality) — worth it once there are ≥3 live plan files.
- [ ] Pin GitHub Actions to commit SHAs (`.github/workflows/ci.yml` uses floating `@v4` tags) — supply-chain item, folded into WP-1 stream D.

## Deferred process improvements (from civion-safe review, 2026-07-15)

Reviewed `civion-labs/Product/civion-safe`'s AI-agent dev process for anything worth porting. Adopted immediately: `docs/handoff/` session-continuity docs, `docs/adrs/_template.md`, warn-only CI doc-discipline check (see `.github/workflows/ci.yml`). The rest is disproportionate at our current scale (one owner, 5 commits, no team) — revisit each at the phase noted, not before:

- ~~**Multi-agent orchestration protocol**~~ — **adopted 2026-07-31**, ahead of the Phase-3 date, on Felix's call. See the Agent harness section above.
- **Weekly dev-journal cron** (auto-generated sprint summary from commit history) — revisit once commit volume is high enough that `docs/handoff/` alone stops giving a good weekly overview; not before Phase 2.
- **Drift-cron** (CI job failing on stale plan-file frontmatter) — only useful once we adopt civion-safe's per-initiative `docs/plans/*.md` pattern; we don't have that structure and TODO.MD is small enough to eyeball. Revisit if TODO.MD's Backlog section outgrows a single scroll.
- **`CONTEXT.md` invariants doc** — partially superseded 2026-07-31: a `CONTEXT.md` now exists as a *domain glossary* (parallel agents don't share Felix's context and were going to invent synonyms for "stay"/"property"/"Saneamiento"). The *numbered-product-invariants* half is still deferred — `idea-v3.md` + CLAUDE.md's "Don't do" list cover it at our size. Revisit at Phase 4+.
- **Backlog-ingest "grill the user" intake skill** — worth it once there's enough inbound backlog volume (multiple contributors, or Felix triaging many feature requests at once) that unstructured intake causes churn. Not before Phase 3.

---

## Notes

- Every P0/P1 fix ships with a regression test. No exceptions.
- All commits go through CI. No direct pushes to `main`.
- TODO status is updated in the same commit as the feature it describes (lesson from Civion: TODOs drift when not part of the commit workflow).
