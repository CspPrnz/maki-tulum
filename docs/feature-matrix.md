# Maki Tulum — Feature Matrix

> Per-feature status across platforms. Updated in the same commit as the work. Mark `n/a` explicitly — never leave empty.
>
> Last updated: 2026-04-18
>
> Legend: ✅ shipped · 🟡 in progress · ⚪ planned · ⏸ deferred · n/a not applicable

---

## Functional building blocks (from `implementation-plan.md` §2)

| # | Block | API | Web | iOS | Android | Notes |
|---|---|---|---|---|---|---|
| B1 | Marketing site | n/a | ⚪ | n/a | n/a | Phase 1 |
| B2 | Availability engine | ⚪ | ⚪ | ⚪ | ⚪ | Phase 2; thin layer over channel manager |
| B3 | Booking / checkout | ⚪ | ⚪ | ⚪ | ⚪ | Phase 2 |
| B4 | Payments (Stripe + MercadoPago + Klarna) | ⚪ | ⚪ | ⚪ | ⚪ | Phase 2 |
| B5 | Channel sync (Hostaway) | ⚪ | n/a | n/a | n/a | Phase 3 — backend only |
| B6 | Guest identity (magic link + JWT) | ⚪ | ⚪ | ⚪ | ⚪ | Phase 3 |
| B7 | Guest verification (Truvi) | ⚪ | ⚪ | n/a | n/a | Phase 3 — embed on web |
| B8 | FMM registration (Chekin) | ⚪ | n/a | n/a | n/a | Phase 3 — silent background |
| B9 | Pre-arrival guest PWA | ⚪ | ⚪ | n/a (uses PWA) | n/a (uses PWA) | Phase 4 |
| B10 | Messaging (WhatsApp + email) | ⚪ | n/a | n/a | n/a | Phase 4 — backend service |
| B11 | Review aggregator | ⚪ | ⚪ | ⚪ | ⚪ | Phase 3 |
| B12 | Housekeeping ops (Breezeway) | n/a | n/a | n/a | n/a | Phase 3 — vendor UI |
| B13 | Maintenance tickets (Breezeway) | n/a | n/a | n/a | n/a | Phase 3 — vendor UI |
| B14 | Smart lock | ⚪ | n/a | n/a | n/a | Phase 4 — via channel manager |
| B15 | Content CMS (MDX) | ⚪ | ⚪ | n/a | n/a | Phase 1 |
| B16 | Owner dashboard | ⚪ | ⚪ | ⚪ | ⚪ | Phase 3 |
| B17 | Retention loop | ⚪ | ⚪ | ⚪ | ⚪ | Phase 4 — the north-star feature |
| B18 | Analytics (Plausible + Postgres) | ⚪ | ⚪ | ⚪ | ⚪ | Phase 3 |
| B19 | Notifications service | ⚪ | n/a | n/a | n/a | Phase 4 — backend fan-out |
| B20 | Admin console | ⚪ | ⚪ | n/a | n/a | Phase 3, under `/admin` |

---

## Three v1 UX bets (from `idea-v3.md` §6)

| Bet | Web | iOS | Android | Status |
|---|---|---|---|---|
| Matterport 3D walkthroughs | ⚪ | ⚪ | ⚪ | Phase 5 |
| Ambient video hero | ⚪ | n/a | n/a | Phase 5 |
| Soft 24-hour date hold (no card) | ⚪ | ⚪ | ⚪ | Phase 5 |

---

## Cross-cutting

| Area | API | Web | iOS | Android | Notes |
|---|---|---|---|---|---|
| Auth (JWT access + rotating refresh) | ⚪ | ⚪ | ⚪ | ⚪ | Web: httpOnly cookies. Native: Keychain/Keystore. |
| i18n (EN/ES/DE) | ⚪ | ⚪ | ⚪ | ⚪ | Synced via `scripts/sync-i18n.ts` once native exists |
| Accessibility (WCAG 2.2 AA) | n/a | ⚪ | ⚪ | ⚪ | Lighthouse a11y ≥90 on new pages |
| Rate limiting | ⚪ | n/a | n/a | n/a | Per-endpoint, day one |
| Audit log | ⚪ | ⚪ (admin view) | n/a | n/a | Append-only |
| CORS (env-scoped) | ⚪ | n/a | n/a | n/a | No localhost in prod |
