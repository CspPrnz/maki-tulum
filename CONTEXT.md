# CONTEXT.md — domain glossary

> Ubiquitous language for Maki Tulum. Read just-in-time when a term is ambiguous — not loaded every session.
> **Rule:** before inventing a synonym for a domain term, check here. If it's missing, add it in the same commit.
>
> Last updated: 2026-07-31

## Property & place

| Term         | Meaning                                                                                                                                                                                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Compound** | The Maki Tulum property as a whole in Xul Kaa, Tulum — shared jungle gardens, pool, common areas. Not a "hotel". Marketing surface: `/[locale]/compound`.                                                                                                           |
| **Xul Kaa**  | The residential colonia at the southwest end of Tulum where the compound sits (postal code 77762). Corrected 2026-07-31 — the project previously recorded **Aldea Zama** throughout, which was wrong. Used in copy and schema.org address, never as a routing slug. |
| **Villa**    | One rentable unit inside the compound, numbered (Villa 18, Villa 19, …). 20 units exist; 2 are live in Phase 1A.                                                                                                                                                    |
| **Stay**     | The guest-facing noun for a bookable unit. Route slug is `stays` (`/en/stays/villa-18`). In the data model the entity is **Property**. `stay` = presentation, `property` = domain.                                                                                  |
| **Property** | Data-model entity for a rentable unit. Owned by an Account. Carries rates, photos, amenities, unit metadata.                                                                                                                                                        |
| **Account**  | Tenant boundary. One account today (Maki). Every tenant-scoped row carries `account_id` and every query filters on it explicitly (ADR 0007, 0008).                                                                                                                  |

## Booking & money

| Term                  | Meaning                                                                                                                                                                                                                                                                                   |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Direct booking**    | A booking made on makitulum.com, no OTA commission. The thing this whole product exists to grow.                                                                                                                                                                                          |
| **OTA**               | Online Travel Agency — Airbnb, Booking.com, Vrbo. Treated as an acquisition channel, not a retention channel.                                                                                                                                                                             |
| **Stay #2**           | Shorthand for the product thesis: OTAs win the first stay, we must win the second one direct. The feature test is _"does this drive stay #2?"_                                                                                                                                            |
| **Quote**             | An itemized, immutable price offer for a date range on a property: base + cleaning + Saneamiento + total, plus FX note. Once displayed it must not silently change downstream (red-team MRT-15-P1-08).                                                                                    |
| **Saneamiento**       | _Derecho de Saneamiento Ambiental_ — a Quintana Roo state environmental levy charged per room-night. Must be itemized in the first displayed quote, never buried.                                                                                                                         |
| **Visitax**           | A separate Quintana Roo visitor tax (~$13 USD/person) that the state collects directly. **Not** charged by us — disclosed as "you pay this separately on arrival".                                                                                                                        |
| **Orphan gap**        | A 1–2 night hole between two bookings that is too short to sell at normal rates. The rate engine auto-discounts these 15–20%.                                                                                                                                                             |
| **LOS discount**      | Length-of-stay discount — a rate reduction that scales with nights booked.                                                                                                                                                                                                                |
| **Deposit / balance** | The two money legs of a booking: a captured deposit at book time, and the remaining balance charged closer to arrival. The T−30 _manual-capture_ design is **broken** and being redesigned (red-team MRT-15-P0-01) — do not implement it as written in `implementation-plan.md` §Phase 2. |
| **Soft hold**         | The Phase 5 bet: a 24-hour date hold with no card. Blocked on proven inventory reserve/release (MRT-15-P2-01).                                                                                                                                                                            |

## Guest lifecycle

| Term               | Meaning                                                                                                                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **North star**     | % of eligible repeat guests who rebook **direct** within 24 months (`idea-v3.md` §12). No vendor in the stack owns this identity graph — we must instrument it ourselves (MRT-15-P1-01).                   |
| **Retention loop** | The post-stay sequence that converts a stay into a direct rebook: consented contact → post-stay trigger → attributable rebook link.                                                                        |
| **Boarding pass**  | The pre-arrival guest surface: directions, door code, check-in window, upsells. Phase 4.                                                                                                                   |
| **FMM**            | _Forma Migratoria Múltiple_ — Mexican immigration form. Distinct from Quintana Roo **lodging-reporting** obligations, which are a separate, still-unscoped legal duty (MRT-15-P1-05). Don't conflate them. |

## Vendors (each gets an adapter in `services/api/src/adapters/` + a fake)

| Vendor                   | Role                                                                                                                            | Status                                                                           |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **Channel manager**      | Pushes availability/rates to OTAs, ingests OTA bookings. Hosthub vs. Hostaway.                                                  | Undecided — ADR 0004 paused. Blocks the Phase 2 inventory schema (MRT-15-P0-02). |
| **Stripe / MercadoPago** | Card + local LatAm payment capture.                                                                                             | Planned, Phase 2.                                                                |
| **Brevo**                | Transactional email **and** WhatsApp — single vendor for both (ADR 0012). Supersedes any Postmark/Twilio mention in older docs. | Decided.                                                                         |
| **Breezeway**            | Housekeeping + maintenance ops. Vendor UI, not rebuilt by us.                                                                   | Phase 3.                                                                         |
| **Enso Connect**         | Guest PWA / boarding pass. Build-vs-buy still open.                                                                             | Phase 4.                                                                         |
| **Truvi**                | Guest ID verification.                                                                                                          | Phase 3.                                                                         |
| **Chekin**               | Guest registration / FMM filing.                                                                                                | Phase 3.                                                                         |
| **Revyoos**              | Cross-OTA review aggregation embed.                                                                                             | Phase 3.                                                                         |
| **Matterport**           | 3D walkthroughs of each stay.                                                                                                   | Phase 5.                                                                         |
| **Sentry / Plausible**   | Errors / analytics.                                                                                                             | Phase 0 remainder.                                                               |

## Process

| Term                  | Meaning                                                                                                                                                                                                    |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Phase 0…6**         | The delivery phases in `implementation-plan.md` §4. Phase 0 = foundations, 1 = marketing site, 2 = booking, 3 = accounts + channel manager, 4 = guest experience, 5 = immersion bets, 6 = retention depth. |
| **Work package (WP)** | A parallelizable slice of a phase with pinned contracts, owned file sets, and one plan file in `docs/backlog/plans/`. The unit of multi-agent orchestration.                                               |
| **Red-team pass**     | An adversarial critique (Codex, persona UAT) logged append-only in `docs/backlog/plans/codex-red-team.md`. Findings get IDs like `MRT-15-P0-01`.                                                           |
| **Evidence**          | The artifact that proves a claim — command + output tail, curl + status/body, SQL + row, diff/SHA. See `CLAUDE.md` § Evidence discipline. "Tests pass" is not evidence.                                    |
