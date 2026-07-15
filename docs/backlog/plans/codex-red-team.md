---
id: plan-codex-red-team
title: Codex red-team review log (running)
status: in_progress
owner: felix
created: 2026-07-15
updated: 2026-07-15
todo_link: docs/backlog/TODO.MD
labels: ['product', 'risk', 'red-team']
note: Review output only. Do not modify product plans or application code from this file.
---

## Maintainer Instructions

- This is the running internal red-team log for Maki Tulum. Do not rewrite or delete past runs; append a dated section for every new pass.
- Each finding must include `Status`, `Area`, `Severity`, `Problem`, `Root cause`, `Objective`, `Test`, `Key files`, and `Sources`.
- A finding must define both an automated/repeatable validation and a manual or decision-validation check where applicable.
- Findings here are review output. File implementation work in `docs/backlog/TODO.MD`; add a Meta-lesson only when the finding concerns project-building practice rather than a product defect.

# Codex Red Team Review

Date: 2026-07-15

## Findings Section — Last Modified: 2026-07-15 CEST

## 2026-07-15 — First Product-plan Red Team Review

## Scope

Reviewed, in order:

- `idea-v3.md`, with emphasis on the thesis, metrics, failure modes, anti-patterns, and open decisions
- `implementation-plan.md`
- ADRs `0001` through `0012`, especially channel manager, admin, Drizzle, and Brevo decisions
- `docs/tasks/TODO.MD`
- `CLAUDE.md`

Validation performed:

- static product-plan and architecture-document cross-check
- targeted current vendor and regulatory documentation review for Stripe, Hostaway, Brevo, Chekin, and Mexico’s INM
- no product code changes and no runtime tests; this is a document-level review

## Executive Summary

The plan has a thesis but not yet an executable operating model for that thesis. The most dangerous gaps are not aesthetic: Phase 2’s balance-payment implementation is technically invalid; the channel-manager decision is deferred past the point at which it defines availability correctness; legal-entity and consent decisions are called open while they already determine the checkout schema; and the retention loop is scheduled after the first direct-booking cohort is created.

The plan also has a governance problem. ADR 0012 selects Brevo while the plan and agent context still name Postmark and Twilio. The implementation plan says there is no code, while current-state documents say Phase 1A shipped. These are not cosmetic discrepancies: they will cause an implementation to be built against obsolete assumptions.

## Previous Findings Re-checked

- None. This is the first adversarial/red-team pass against the finished plan.

## Findings

### MRT-15-P0-01: The Phase 2 balance-payment design cannot execute at T−30
**Status**: Open
**Area**: Payments / booking correctness
**Severity**: Blocks Phase 2
**Problem**: Phase 2 proposes a 30% deposit and scheduled capture of the remaining 70% at T−30 using a Stripe PaymentIntent with `capture_method: manual`. Manual capture is an authorization hold, not an authorization to charge later. Uncaptured PaymentIntents are normally cancelled after seven days, so a booking made more than seven days before T−30 will lose its balance authorization.
**Root cause**: The plan conflates delayed capture with an off-session future payment.
**Objective**: Use a captured deposit payment plus a separately created off-session balance charge, with saved-payment-method consent, SCA recovery, retries, cancellation/refund rules, and a manual collection fallback.
**Test**:
- Automated: Stripe test-clock suite creates bookings 7, 31, 90, and 365 days before arrival and proves the deposit, T−30 balance attempt, failure/retry, and cancellation paths all reconcile to the booking ledger.
- Automated: contract test rejects any booking implementation that schedules a capture against a PaymentIntent whose `capture_before` precedes the scheduled capture time.
- Manual: complete the four scenarios in Stripe test mode and reconcile Stripe Dashboard, the booking detail, and the owner revenue view.
**Key files**: `implementation-plan.md` §4 Phase 2; future `services/api/src/adapters/payments/stripe.ts`; future booking/payment migrations.
**Sources**:
- Plan: `implementation-plan.md` §4 Phase 2.
- Stripe: https://docs.stripe.com/payments/place-a-hold-on-a-payment-method
- Stripe API: https://docs.stripe.com/api/payment_intents/capture

### MRT-15-P0-02: Channel-manager selection is deferred past the point where it defines availability correctness
**Status**: Open
**Area**: Channel sync / availability architecture
**Severity**: Blocks Phase 2
**Problem**: The thesis makes direct inventory the source of truth, and Phase 2 builds availability, rates, bookings, holds, and orphan-gap rules. ADR 0004 defers selecting the channel manager until Phase 3. No selected vendor has proved it can accept Maki’s authoritative calendar/rate model and propagate it to every required OTA. A sellable direct calendar cannot be safely designed independently of its channel manager’s inventory and reservation semantics.
**Root cause**: ADR 0004 treats the vendor as an implementation detail even though it sets the boundaries of the central inventory model.
**Objective**: Select and validate the channel manager before freezing Phase 2’s availability/rates schema. Keep Phase 2 staging-only until the acceptance test passes.
**Test**:
- Automated: vendor-sandbox contract suite covers direct booking, OTA booking, cancellation, modification, owner block, rate update, and webhook replay; each must converge to one calendar state within the defined SLA.
- Automated: reconciliation job detects any mismatch between Maki, the vendor, and each connected OTA test listing.
- Manual: execute the same scenarios in both shortlisted vendor trials and sign a capability matrix before committing to an adapter.
**Key files**: `idea-v3.md` §6/§9/§13; `implementation-plan.md` B2/B5, Phases 2–3, §5; `docs/adrs/0004-channel-manager-paused.md`.
**Sources**:
- ADR: `docs/adrs/0004-channel-manager-paused.md`.
- Hostaway API: https://api.hostaway.com/documentation

### MRT-15-P0-03: “A one-file adapter swap” is not credible for channel managers
**Status**: Open
**Area**: Buy-vs-build / integration risk
**Severity**: Blocks Phase 2
**Problem**: The adapter layer promises that Hostaway-to-Hospitable switching is a one-file change. Channel managers expose materially different inventory, rate-plan, taxes/fees, payment, booking-status, webhooks, and message models. Those semantics shape the domain schema and customer-visible checkout behavior; an adapter cannot erase them.
**Root cause**: The plan applies an interface abstraction before proving that the products share the required capability contract.
**Objective**: Define Maki’s outcome-level capability contract and select only a vendor that meets it without semantic compromises hidden in the adapter.
**Test**:
- Automated: capability-contract tests run unchanged against each vendor sandbox/fake and cover all required outcomes.
- Automated: CI fixture suite verifies tax/fee, cancellation, rate, and booking-status mappings are lossless.
- Manual: review the capability matrix with the owner and record accepted unsupported cases as explicit product constraints.
**Key files**: `implementation-plan.md` §5; `docs/adrs/0004-channel-manager-paused.md`; future `services/api/src/adapters/channel-manager/`.
**Sources**:
- Plan: `implementation-plan.md` §5.
- ADR: `docs/adrs/0004-channel-manager-paused.md`.

### MRT-15-P0-04: Legal entity and payments are already checkout blockers, not deferred decisions
**Status**: Open
**Area**: Payments / tax / legal operations
**Severity**: Blocks Phase 2
**Problem**: Open decision #8 determines the merchant of record, Stripe account country, settlement currency, invoice issuer, tax treatment, OXXO eligibility, MercadoPago contract, refunds, disputes, and installment availability. Phase 2 already commits to all of those behaviors.
**Root cause**: The plan labels an irreversible payments/tax foundation decision as “before build” but does not place it in the Phase 2 critical path or TODO.
**Objective**: Select the legal/payment operating model before any production checkout work and define the supported payment-method/currency combinations from that choice.
**Test**:
- Automated: payment-method eligibility table is represented as configuration and tested for every supported guest-country, merchant-country, currency, deposit, balance, and refund combination.
- Automated: invoice/tax line-item snapshots pass for every supported currency.
- Manual: Mexican/EU counsel and the selected PSP confirm the merchant, settlement, invoice, and consumer-refund model in writing.
**Key files**: `idea-v3.md` §9 and §15.8; `implementation-plan.md` B3/B4 and Phase 2; `docs/backlog/TODO.MD`.
**Sources**:
- Thesis: `idea-v3.md` §15.8.
- Stripe Mexico installments: https://docs.stripe.com/payments/mx-installments

### MRT-15-P0-05: Consent scope is unresolved after data collection has begun and before Phase 2 expands it
**Status**: Open
**Area**: Privacy / retention / data model
**Severity**: Blocks Phase 2
**Problem**: The plan needs checkout identity, WhatsApp opt-in, rebooking attribution, post-stay marketing, review prompts, and possible OTA-originated contact. These have different lawful bases, retention periods, disclosure requirements, and platform permissions. Open decision #10 remains unresolved while Phase 1A already persists locale preference and Phase 2 is about to create guest data and payment records.
**Root cause**: Privacy is framed as a checkout consent checkbox rather than a data-lifecycle and communication-permission design.
**Objective**: Create a counsel-reviewed data map and consent matrix before the booking schema and messaging workflows are implemented.
**Test**:
- Automated: schema/API tests prove every marketing or WhatsApp send requires a recorded consent/lawful-basis state and that delete/export requests reach every Maki-owned store.
- Automated: retention job test deletes/anonymizes records at the approved expiry date without deleting accounting records that must be retained.
- Manual: privacy counsel signs the data map covering direct and OTA-originated guests; product review verifies the checkout explains each optional communication separately.
**Key files**: `idea-v3.md` §15.10; `implementation-plan.md` B10/B17/B18 and §8.12; `CLAUDE.md` constraints.
**Sources**:
- Thesis: `idea-v3.md` §15.10.
- Plan: `implementation-plan.md` §8.12.

### MRT-15-P1-01: The north-star metric cannot be measured from the stated stack without a new first-party identity and attribution model
**Status**: Open
**Area**: Thesis measurement / analytics
**Severity**: Blocks Phase 2
**Problem**: “% of eligible repeat guests who rebook direct within 24 months” has no definition of eligible guest, identity resolution across OTA/direct stays, consent state, cohort start, attribution, exclusions, or denominator snapshot. Hostaway, Breezeway, and Enso are operational tools; none is established in the plan as the authoritative cross-channel customer graph. Deferring this to a Phase 6 exit criterion means Phase 2 may omit irreversible events and identifiers.
**Root cause**: A strategic metric was named before its instrumentation contract and data ownership were designed.
**Objective**: Define and implement the metric’s cohort/identity/attribution contract in Phase 2.
**Test**:
- Automated: seeded OTA/direct identities, aliases, consent withdrawals, cancellations, and rebooks yield the expected immutable cohort denominator and numerator.
- Automated: dashboard query produces the same result from raw event fixtures and the materialized metrics view.
- Manual: owner can audit one metric result to identifiable source events without accessing unnecessary PII.
**Key files**: `idea-v3.md` §12; `implementation-plan.md` B17/B18 and Phase 6; future booking/guest/event schema.
**Sources**:
- Thesis: `idea-v3.md` §12.
- Plan: `implementation-plan.md` B17/B18 and Phase 6.

### MRT-15-P1-02: The plan creates direct-booking cohorts before it creates the retention loop
**Status**: Open
**Area**: Sequencing / thesis execution
**Severity**: Blocks Phase 2
**Problem**: Phase 2 and Phase 3 create direct booking and production launch, but the minimum relationship loop—consented contact capture, post-stay trigger, returning-guest offer, and attributable rebook link—is Phase 4. The first real guests are therefore structurally unable to receive the behavior the thesis depends on.
**Root cause**: Retention is scheduled as a guest-experience enhancement rather than as the product’s core value capture.
**Objective**: Move a minimum viable retention slice into Phase 2, while leaving PWA, smart locks, and upsells in Phase 4.
**Test**:
- Automated: staging booking lifecycle produces consent-aware confirmation, post-stay event, offer, and attributable rebook link.
- Automated: cancellation/consent-withdrawal tests prove sequences stop appropriately.
- Manual: conduct a complete test guest journey and verify the relationship starts at booking and remains useful after checkout.
**Key files**: `idea-v3.md` §1/§11/§12; `implementation-plan.md` Phases 2–4.
**Sources**:
- Thesis: `idea-v3.md` §1, §11, §12.
- Plan: `implementation-plan.md` Phases 2–4.

### MRT-15-P1-03: The German wedge is neither proven load-bearing nor managed as optional
**Status**: Open
**Area**: ICP / positioning / content investment
**Severity**: Blocks Phase 1B
**Problem**: The thesis names German language as a differentiator and warns the wedge may not materialize. The plan says validate DE search demand before deeper investment, yet Phase 1A has already shipped all three languages. There is no market-segmented P&L, conversion target, repeat-direct target, or US-only fallback model, so the team cannot determine whether DE is essential to the economics or merely additional reach.
**Root cause**: The validation gate was written but not made a prerequisite to language-content investment.
**Objective**: Model US-only and DE-incremental economics separately and establish an evidence-based DE investment threshold and stop rule.
**Test**:
- Automated: analytics dashboard reports acquisition, conversion, ADR, contribution margin, repeat rate, and repeat-direct rate by market/language.
- Automated: content-publishing check blocks DE guide expansion without a recorded validation decision.
- Manual: review search demand and early conversion evidence, then record either “core channel,” “maintain essentials,” or “deprioritize” in TODO/ADR.
**Key files**: `idea-v3.md` §2/§13/§15.7; `implementation-plan.md` §10; `docs/backlog/TODO.MD` Phase 1B.
**Sources**:
- Thesis: `idea-v3.md` §2, §13, §15.7.
- Plan: `implementation-plan.md` §10.

### MRT-15-P1-04: Messaging provider decisions contradict each other
**Status**: Open
**Area**: Messaging / operational consistency
**Severity**: Blocks Phase 2
**Problem**: ADR 0012 accepts Brevo for transactional email and WhatsApp. The implementation plan still names Postmark as default and Twilio/Bookboost for WhatsApp; CLAUDE.md likewise states Postmark and Twilio. These choices have different adapters, credentials, consent architecture, inbound-message handling, template approval, and operational failure modes.
**Root cause**: ADR acceptance did not trigger a repository-wide update of the implementation plan and operating context.
**Objective**: Choose the canonical messaging architecture, document why, and remove all contradictory provider assumptions before Phase 2 transactional email and Phase 4 WhatsApp work.
**Test**:
- Automated: configuration audit fails if obsolete provider env vars, adapters, or documentation remain after the decision.
- Automated: each email template renders in EN/ES/DE and each WhatsApp template has an approved, consent-aware sending path.
- Manual: complete Brevo WhatsApp onboarding and test booking confirmation, inbound reply routing, and template approval on the intended business number.
**Key files**: `docs/adrs/0012-brevo-email.md`; `implementation-plan.md` §3.1/B10/§9; `CLAUDE.md` Stack.
**Sources**:
- ADR: `docs/adrs/0012-brevo-email.md`.
- Brevo WhatsApp setup: https://help.brevo.com/hc/fr/articles/4417084910866-Partie-1-lier-votre-compte-WhatsApp-Business-%C3%A0-Brevo

### MRT-15-P1-05: “Chekin handles FMM guest registration” is an unvalidated compliance category error
**Status**: Open
**Area**: Mexican compliance / vendor validation
**Severity**: Blocks Phase 2
**Problem**: The documents describe FMM guest registration as a property-host compliance workflow to buy from Chekin. FMM is an immigration entry process. INM guidance says visitors entering via international airports do not need to fill out or carry an FMM; the plan has not identified the actual Quintana Roo lodging-reporting, tax, or guest-record obligations that a host must satisfy.
**Root cause**: A vendor capability was assumed to satisfy a legal obligation before the obligation was identified.
**Objective**: Obtain Mexican hospitality counsel’s written obligation list, then validate a chosen vendor against those exact obligations rather than against the label “FMM.”
**Test**:
- Automated: compliance adapter test verifies required fields, submission status, failure alerts, retention, and deletion behavior for the actual mandated system.
- Automated: booking acceptance blocks or escalates only when legally required registration data is missing, not because of an assumed FMM workflow.
- Manual: counsel reviews the complete guest registration journey for airport and land-border guests and confirms operational responsibility.
**Key files**: `idea-v3.md` §6/§9; `implementation-plan.md` B8.
**Sources**:
- INM: https://www.inm.gob.mx/gobmx/word/index.php/paises-no-requieren-visa-para-mexico/
- INM FMM: https://www.inm.gob.mx/fmme/publico/solicitud.html

### MRT-15-P1-06: The plan calls the most difficult booking core “thin build over buy” without choosing which system owns it
**Status**: Open
**Area**: Buy-vs-build boundary / checkout integrity
**Severity**: Blocks Phase 2
**Problem**: B2 and B3 build inventory authority, rate calculation, holds, taxes/fees, cancellation tiers, deposit/balance payment schedules, and checkout. Those are the operational core normally supplied by a PMS/channel manager/booking engine. Calling them a thin layer masks their true scope and makes it likely that custom and vendor pricing disagree.
**Root cause**: The plan treats guest-facing differentiation and booking-engine ownership as the same decision.
**Objective**: Explicitly choose either a bought booking engine with accepted UX limitations or a strategic custom booking core with the required engineering, reconciliation, and operational ownership.
**Test**:
- Automated: every quote is reconciled against the payment intent, booking record, channel-manager record, and owner reporting record for all taxes, fees, discounts, and currencies.
- Automated: integration test proves an OTA-originated booking and a direct booking apply the same inventory rules without hidden fee divergence.
- Manual: review the selected ownership model with the owner and sign off on its total cost, vendor fees, failure support, and fallback procedure.
**Key files**: `idea-v3.md` §6; `implementation-plan.md` B2/B3/B5, Phase 2; `CLAUDE.md` “Don’t do”.
**Sources**:
- Plan: `implementation-plan.md` B2/B3/B5.
- Hostaway booking-engine behavior: https://support.hostaway.com/hc/en-us/articles/50219711579419-Booking-Website-Common-Questions

### MRT-15-P1-07: The multi-language, multi-currency, WhatsApp journey is assumed across vendors, not acceptance-tested as one journey
**Status**: Open
**Area**: Vendor integration / ICP execution
**Severity**: Blocks Phase 2
**Problem**: The ICP needs EN/ES/DE, USD/EUR/MXN display, deposit/balance/refund behavior, and WhatsApp-first comms. Each vendor may support a subset, but the plan has no evidence that Hostaway/Hosthub, Stripe, MercadoPago, Brevo, and Enso support the combined journey and its handoffs.
**Root cause**: Vendor capability is checked feature-by-feature in prose rather than as a customer journey.
**Objective**: Establish a mandatory end-to-end vendor acceptance test before contracts or production checkout implementation.
**Test**:
- Automated: vendor contract suite exercises EN/ES/DE booking, USD/EUR/MXN quotation, payment/refund, consented WhatsApp template, and PWA handoff.
- Automated: unsupported combinations are rejected before payment rather than silently degrading or changing price/language.
- Manual: run the complete journey on iOS Safari and Android from each target locale and document any fallback copy or unsupported method.
**Key files**: `idea-v3.md` §6/§9; `implementation-plan.md` B4/B5/B9/B10; ADRs 0004 and 0012.
**Sources**:
- Hostaway language support: https://support.hostaway.com/hc/en-us/articles/50219711579419-Booking-Website-Common-Questions
- Brevo transactional WhatsApp: https://help.brevo.com/hc/fr/articles/15923206071826-Personnaliser-vos-messages-WhatsApp-avec-des-param%C3%A8tres-transactionnels

### MRT-15-P1-08: The anti-pattern most likely to ship is hidden or changed pricing
**Status**: Open
**Area**: Anti-pattern enforcement / checkout integrity
**Severity**: Blocks Phase 2
**Problem**: The plan promises all-in pricing on the first rate display, but custom quotes, FX notes, payment-method restrictions, vendor rounding, tax configuration, channel-manager fees, and optional services can alter the amount later. Hostaway documents rounding displayed listing prices before final checkout. Without a quote-integrity invariant, Maki can violate its central confidence promise while believing fees are itemized.
**Root cause**: Fee transparency is a UX statement, not a tested cross-system money invariant.
**Objective**: Make the first displayed quote immutable: line items, currency, FX disclosure, and allowed changes must persist from display through payment and reporting.
**Test**:
- Automated: property-based quote tests compare first-display quote, checkout quote, payment amount, confirmation, and ledger for every payment/currency/rate rule.
- Automated: release gate fails if a total changes after the first rate display without a guest-selected optional item and explicit reconfirmation.
- Manual: conduct price-audit sessions in all three languages and currencies, including a cancellation/refund, and compare screenshots to the payment ledger.
**Key files**: `idea-v3.md` §3/§9/§14; `implementation-plan.md` Phase 2.
**Sources**:
- Thesis: `idea-v3.md` §3 and §14.
- Hostaway: https://support.hostaway.com/hc/en-us/articles/50219711579419-Booking-Website-Common-Questions

### MRT-15-P2-01: The Phase 5 no-card hold can become prohibited urgency theatre or inventory leakage
**Status**: Open
**Area**: Anti-pattern enforcement / inventory
**Severity**: Worth a lessons-learned entry
**Problem**: The 24-hour no-card hold is scheduled after booking launch and before any demonstrated channel-manager synchronization. If it blocks inventory, it can starve OTA sales; if it does not, guests receive a misleading promise. If presented with expiry pressure, it becomes the urgency theatre explicitly prohibited in §14.
**Root cause**: A conversion tactic is specified before its inventory truth and brand constraints are designed.
**Objective**: Do not ship a hold until inventory reserve/release behavior is proven across the live channel manager; prohibit urgency/countdown copy in the acceptance criteria.
**Test**:
- Automated: hold creation, expiry, conversion, cancellation, and concurrent OTA booking tests prove no inventory leakage or double booking.
- Automated: content lint/snapshot test rejects countdown, scarcity, or deceptive hold copy.
- Manual: brand review confirms the hold reads as a service, not pressure, and works correctly when another channel books the dates.
**Key files**: `idea-v3.md` §8/§14; `implementation-plan.md` Phase 5.
**Sources**:
- Thesis: `idea-v3.md` §8 and §14.

### MRT-15-P2-02: Current-state documentation is contradictory and cannot safely control sequencing
**Status**: Open
**Area**: Plan governance / documentation integrity
**Severity**: Worth a lessons-learned entry
**Problem**: `implementation-plan.md` still says “No code yet” and is dated 2026-05-02. `docs/backlog/TODO.MD` and `CLAUDE.md` say Phase 1A landed and list a materially different current state. A planning document that is stale at the point it governs Phase 1B/2 cannot be relied on for dependencies or acceptance gates.
**Root cause**: Status updates were made in operational tracker/context files but not reconciled into the primary implementation plan.
**Objective**: Reconcile current state and decision status across the plan, TODO, CLAUDE, and ADRs before beginning the next phase; add a lightweight consistency check.
**Test**:
- Automated: documentation check compares declared phase status and canonical provider decisions across `implementation-plan.md`, `docs/backlog/TODO.MD`, `CLAUDE.md`, and ADR statuses.
- Automated: CI warns or fails when a plan’s `Last updated` date predates shipped work recorded in TODO by more than an agreed window.
- Manual: a new maintainer reads the four documents and can correctly state the active phase, selected messaging provider, deferred channel-manager decision, and next blocked decision within five minutes.
**Key files**: `implementation-plan.md` Current state; `docs/backlog/TODO.MD`; `CLAUDE.md`; `docs/adrs/0012-brevo-email.md`.
**Sources**:
- Plan: `implementation-plan.md` Current state.
- Tracker/context: `docs/backlog/TODO.MD`, `CLAUDE.md`.

## Meta-lessons to Add if Findings Are Accepted

| Finding | Proposed meta-lesson | Preventive measure |
|---|---|---|
| MRT-15-P0-02 | A deferred vendor decision is not non-blocking when it defines the domain model. | Add a dependency gate requiring vendor proof-of-capability before schema/contract freeze. |
| MRT-15-P0-03 | An adapter is not evidence that vendors are interchangeable. | Require a capability matrix and sandbox contract suite before promising a vendor swap is low-cost. |
| MRT-15-P0-05 | Privacy decisions must precede data-schema and lifecycle design. | Require a data map, lawful-basis matrix, and deletion/retention design before any new guest-data collection. |
| MRT-15-P1-04 | Accepted ADRs must trigger a repository-wide contradiction check. | Add a checklist/CI doc scan for superseded provider and architecture choices. |
| MRT-15-P2-01 | Conversion features require an explicit anti-pattern invariant. | Add anti-pattern acceptance checks to every growth/checkout experiment. |
| MRT-15-P2-02 | Plans must be reconciled when shipped state changes. | Make current-state reconciliation a required close-out step for each phase. |
