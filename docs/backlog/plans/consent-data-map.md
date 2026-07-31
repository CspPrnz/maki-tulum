---
id: consent-data-map
title: Guest-data map, lawful-basis matrix, and retention design
status: draft # draft | approved | in_progress | blocked | done
phase: 2
owner: Felix (decision) / orchestrator (draft)
created: 2026-07-31
updated: 2026-07-31
depends_on: [legal-entity-brief]
---

# Consent scope, data map, and retention

> **Not legal advice.** This is an engineering artifact written to make a conversation with counsel short and precise. Every "verify" item below is a question for a lawyer, not a conclusion.
>
> Resolves red-team finding **MRT-15-P0-05** (`idea-v3.md` §15.10), which blocks Phase 2's booking schema.

## Why this must land before the schema

Phase 1A already persists a locale preference. Phase 2 adds guest identity, contact details, a stored payment token, and stay history — and ADR 0016 keys a Stripe Customer to the guest's email at booking time. Designing those tables before deciding lawful basis and retention means retrofitting deletion, export, and consent state into a live money-path schema. That is the exact sequencing error the red team flagged, and it is cheap to avoid now and expensive to fix later.

**Two regimes apply simultaneously.** Guests are international (the ICP note of 2026-07-15 is explicit that Maki serves guests broadly), so EU/UK guests bring GDPR. The property and likely the operating entity are Mexican, bringing Mexico's federal data-protection regime. Which entity is the controller depends on the legal-entity decision — see [`legal-entity-brief.md`](legal-entity-brief.md). **This document cannot be finalized before that one.**

> ⚠️ **Verify with counsel:** Mexico's data-protection statute was restructured following the dissolution of INAI, and the current supervisory authority and notice requirements should be confirmed against the law in force in 2026 rather than the 2010 LFPDPPP as commonly summarized. Treat every Mexico-side reference below as provisional.

## What we process today (Phase 1A, live)

| Data              | Where                                 | Purpose                  | Notes                                                                                                                                                                     |
| ----------------- | ------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Locale preference | cookie, set by middleware             | serve the right language | Strictly necessary for a user-requested feature. Almost certainly no consent banner needed — verify.                                                                      |
| Page analytics    | Plausible                             | aggregate traffic        | Cookieless, no cross-site identifiers. The reason no cookie banner has shipped. Verify that Plausible's configuration for this site does not retain full IPs.             |
| Error events      | Sentry (not yet wired; WP-1 stream C) | debugging                | **Sentry can capture IP addresses and request context by default.** Configure scrubbing before it goes live, or it silently becomes the first PII processor in the stack. |

## What Phase 2 adds

| Data                                   | Lawful basis (GDPR, proposed) | Retention (proposed)                      | Notes                                                                                                                                                        |
| -------------------------------------- | ----------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Guest name                             | contract                      | 10 years from stay                        | Tax/accounting retention likely dominates the privacy minimum — verify the actual Mexican fiscal retention period.                                           |
| Guest email                            | contract (for the booking)    | 10 years                                  | Reuse for _marketing_ is a different basis — see below.                                                                                                      |
| Guest phone                            | contract                      | 10 years                                  | Needed for WhatsApp in Phase 4; the WhatsApp channel itself is a separate consent question.                                                                  |
| Booking dates, property, party size    | contract                      | 10 years                                  |                                                                                                                                                              |
| Quote snapshot + money breakdown       | contract + legal obligation   | 10 years                                  | Immutable per MRT-15-P1-08.                                                                                                                                  |
| Stripe customer + payment-method token | contract                      | duration of relationship + dispute window | **We store Stripe's token, never card data.** ADR 0016 depends on this being retained until the balance is charged.                                          |
| Billing address                        | legal obligation (tax)        | 10 years                                  | Only if invoicing requires it — don't collect speculatively.                                                                                                 |
| IP address at booking                  | legitimate interest (fraud)   | 90 days                                   | Shortest defensible window; verify.                                                                                                                          |
| Marketing/retention contact            | **consent**                   | until withdrawn                           | See below. This is the one that matters most.                                                                                                                |
| ID document / guest registration       | legal obligation              | per statute                               | Only if the lodging-reporting obligation requires it. **Do not collect until that obligation is established** — see MRT-15-P1-05 in `legal-entity-brief.md`. |

## The consent question that actually matters

The product thesis is retention: convert stay #1 into a direct stay #2. That requires contacting a guest **after** their stay, which is not covered by the contract basis that justified taking their email in the first place.

This is the single highest-stakes privacy decision in the project, because the north-star metric depends on it. Getting it wrong in either direction is expensive: too aggressive and it is unlawful for EU guests; too timid and MRT-15-P1-02's "minimum retention slice in Phase 2" has no lawful data to run on.

**Proposed design, for counsel to confirm:**

- **Separate, unbundled, opt-in consent** for post-stay marketing, captured at booking with its own checkbox — never pre-ticked, never a condition of booking.
- **Consent state is versioned and auditable**: what text was shown, when, from which IP, and every change. A claim of consent we cannot evidence is not consent.
- **Withdrawal is one click** from every message and takes effect immediately, not "within 30 days."
- **Transactional messages are not marketing** — booking confirmation, balance-due notice, arrival instructions ride the contract basis and must not be bundled into the marketing toggle.
- **A post-stay rebook offer is marketing.** It is the retention loop's core message and it needs the consent above. Verify whether a soft-opt-in / existing-customer exemption applies for EU guests; do not assume it does.

## Processors and transfers

Each of these receives guest data and needs a data-processing agreement, plus a transfer mechanism where data leaves the EEA/UK:

| Processor                   | Data                                  | Notes                                                                                                                                                                                        |
| --------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stripe / MercadoPago        | payment + guest identifiers           |                                                                                                                                                                                              |
| Brevo (ADR 0012)            | email + phone, message content        | EU-based, which helps.                                                                                                                                                                       |
| Channel manager (undecided) | full booking + possibly guest contact | **Vendor not yet chosen.** Whether guest contact details reach us at all is a scored capability in the channel-manager contract — a vendor that withholds them breaks the north-star metric. |
| Sentry                      | error context, possibly IP            | Scrub before enabling.                                                                                                                                                                       |
| Railway                     | everything at rest                    | Hosting region matters for the transfer analysis.                                                                                                                                            |

## Engineering requirements that follow

These are the parts that constrain the Phase 2 schema, and the reason this document blocks it:

1. **A `consents` table** — subject, purpose, granted/withdrawn, timestamp, notice version, evidence. Not a boolean on the guest row; consent has history.
2. **Deletion must be designed, not retrofitted.** Decide per-table now: hard delete, anonymize-in-place, or retain under a legal-obligation exemption. Financial records almost certainly cannot be deleted on request — that carve-out has to be explicit and documented.
3. **Export (DSAR / ARCO access) needs a query path** across every table holding guest data. If the schema makes that a manual archaeology exercise, the schema is wrong.
4. **`account_id` scoping applies to guest data like everything else** (ADR 0007/0008).
5. **Retention is enforced by a job, not by intention.** An unenforced retention policy is a liability, not a control.
6. **A privacy notice must exist before the first real booking**, in EN/ES/DE like every other user-facing string.

## Questions for counsel

1. Which entity is the controller, and does the answer change with the legal-entity decision?
2. Does Mexico's current regime require a specific privacy-notice form, and what is the supervisory authority now?
3. What is the actual fiscal retention period for booking and payment records, and does it override privacy-side minimization?
4. Is a post-stay rebook offer to a past guest permissible under a soft-opt-in for EU guests, or does it require prior explicit consent?
5. Does the Quintana Roo lodging-reporting obligation require collecting or retaining ID documents, and for how long? (Also open in `legal-entity-brief.md`.)
6. Is a cookie banner required at all, given a cookieless analytics stack and a strictly-necessary locale cookie?
7. What transfer mechanism is needed for guest data reaching US-based processors?

## Out of scope

Employee/contractor data (Breezeway, housekeeping), and owner-side financial reporting. Both matter; neither blocks the Phase 2 booking schema.
