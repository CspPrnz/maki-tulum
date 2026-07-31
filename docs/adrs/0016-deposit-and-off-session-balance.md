# ADR 0016 — Captured deposit + off-session balance charge (replaces manual-capture-at-T−30)

- **Date:** 2026-07-31
- **Status:** **superseded by [ADR 0017](0017-charge-in-full-at-booking.md)** (2026-07-31 — Felix chose to charge 100% at booking rather than take on the deposit/balance machinery). Kept because the analysis of _why_ the original T−30 manual-capture design cannot work still stands, and because reviving the split later means reviving the security corrections below with it. Originally: resolves red-team finding MRT-15-P0-01.
- **Context:**

`implementation-plan.md` §4 Phase 2 specifies "30% deposit at booking, scheduled capture of 70% at T−30 days (Stripe PaymentIntent with `capture_method: manual` + BullMQ job)."

**This cannot execute.** Manual capture places an _authorization hold_, which is not permission to charge later. Card authorizations expire — Stripe cancels uncaptured PaymentIntents after about seven days, and issuers may release the hold sooner. Any booking made more than seven days before T−30 loses its balance authorization before the job ever runs. Since T−30 is itself 30 days before arrival, **every booking made more than ~37 days ahead fails**, which is most of them for a destination property.

The design conflates two different Stripe primitives: delayed _capture_ of an authorized amount, and an _off-session future payment_ against a stored payment method. A second, quieter problem: capture is bounded by the authorized amount, so a single hold cannot cleanly express a 30/70 split of a changing total.

- **Decision:**

Two independent payments against one booking ledger.

**Leg 1 — deposit, on-session, captured immediately.** At booking, create a PaymentIntent for the deposit with automatic capture and `setup_future_usage: 'off_session'`, against a Stripe Customer keyed to the booking's guest email. The guest is present, so SCA completes interactively and the resulting mandate is strong. Money is actually in hand, not held.

**Leg 2 — balance, off-session, at T−30.** A scheduled job creates a _new_ PaymentIntent for the balance with `off_session: true, confirm: true` against the saved payment method. Nothing depends on an authorization made 90 days earlier.

**Consent is explicit and captured at booking time.** The checkout UI states the balance amount, the exact charge date, and the card it will hit, before the guest confirms. We persist what was shown, when, and to which payment method. This is a Stripe requirement for off-session charging and independently the honest reading of the "no hidden fees" promise in `idea-v3.md` §14 — a surprise charge 30 days later is exactly the OTA behavior this product exists to be better than.

**Failure handling is a designed path, not an exception.** Off-session charges fail routinely:

| Failure                                      | Handling                                                                                                                                                                                                                    |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `authentication_required` (SCA)              | Booking → `balance_action_required`. Send the guest a magic link to an on-session confirmation page to complete 3DS. This is the common EU case and must not be treated as a decline.                                       |
| Soft decline (insufficient funds, temporary) | Dunning ladder: retry at +1d, +3d, +7d, each with guest notification.                                                                                                                                                       |
| Hard decline (card cancelled, expired)       | Immediate guest notification with a link to update the payment method. No silent retries.                                                                                                                                   |
| Ladder exhausted before arrival              | Escalate to owner for manual collection. Cancellation policy applies per tier; **the booking is never auto-cancelled by a payment job** — releasing inventory automatically on a payment hiccup is worse than a phone call. |

**Our ledger is the source of truth; Stripe is the gateway.** Every attempt writes a row (attempt, outcome, Stripe object id, amount, currency). Booking state derives from the ledger, never from a live Stripe read.

**Idempotency keys on every charge attempt**, and current state is checked before the side effect (CLAUDE.md constraint). A retried BullMQ job must never double-charge.

**The quote snapshot is immutable.** `deposit + balance == the total displayed at booking`, enforced as an invariant test, so this design cannot silently violate MRT-15-P1-08.

- **Consequences:**
  - **Works at any booking horizon** — 7 days or 365. The failure mode that blocked Phase 2 is gone.
  - **Deposit funds settle immediately**, improving cash position versus holding an authorization.
  - **A deposit refund is now a real refund**, not a void. Tiered cancellation must be modelled against captured money, which is more work than releasing a hold and is the honest cost of this approach.
  - **SCA recovery is mandatory scope, not a stretch goal.** European guests are a meaningful share of the market; without the on-session recovery page, `authentication_required` reads as a dead booking.
  - **Voucher and bank-transfer methods break the model.** OXXO and SPEI are push payments with no reusable payment method — there is nothing to charge off-session at T−30. For those, the options are pay-in-full at booking or a hosted invoice link at T−30. **This must be decided before MercadoPago/OXXO ship**, and it interacts with the legal-entity decision (`docs/backlog/plans/legal-entity-brief.md`), since OXXO eligibility is Mexico-entity sensitive. Card-only for v1 is a legitimate and probably correct simplification.
  - **Two payments means two currency moments.** If the balance is charged in a different FX environment than the deposit, the guest can see a total that differs from the quote in their home currency. We charge both legs in the same currency as the quote; any FX difference is the issuer's, and the quote page says so.
  - **A stored payment method is stored personal data.** It enters the consent data map and the retention policy — see `docs/backlog/plans/consent-data-map.md`. We store Stripe's token, never card data.
  - **Guest identity now begins at booking**, since the Stripe Customer is keyed to the guest email. That is convenient for the north-star identity graph (MRT-15-P1-01) but means the lawful basis for holding that email must be settled first, not after.

- **Alternatives considered:**
  - **Charge 100% at booking.** Simplest, no scheduled job, no dunning. Rejected for v1 because a full upfront charge on a multi-thousand-dollar stay measurably suppresses conversion, and beating the OTAs on booking experience is the point. Worth revisiting if the dunning ladder proves expensive to operate — the complexity saved is substantial and this is the honest fallback.
  - **SetupIntent at booking, both legs off-session.** Coherent, but wastes the one moment when the guest is present and authenticating. On-session capture of the deposit yields a stronger mandate and immediate confirmation that the card is real.
  - **Re-authorize periodically until T−30.** Keeps the "hold" mental model. Rejected: repeated authorizations annoy issuers, can appear as pending charges on the guest's statement, and multiply failure surface for no gain.
  - **Stripe Invoicing for the balance leg.** Genuinely reasonable — auto-charges the saved method and provides a hosted payment page as a built-in fallback. Rejected as the primary mechanism because it puts invoice objects in the money path alongside our own ledger, giving two sources of truth for the same obligation. **Reconsider specifically as the failure-path fallback** rather than the happy path.
  - **Stripe Billing / subscription schedules.** Wrong semantics — this is one obligation split in two, not a recurring plan.

## Implementation notes (Phase 2)

- Adapter at `services/api/src/adapters/payments/stripe.ts` behind a `PaymentProvider` interface with a fake, per `implementation-plan.md` §5. Handlers never import the Stripe SDK.
- **Test with Stripe test clocks.** The red team's acceptance bar: bookings created 7, 31, 90, and 365 days before arrival, each proving deposit → T−30 balance attempt → failure/retry → cancellation all reconcile against the booking ledger.
- **Add a contract test that fails any implementation scheduling a capture against a PaymentIntent whose authorization expires before the scheduled time.** This is the specific regression that produced this ADR; without the test, the design can silently come back.
- Webhook handling for `payment_intent.succeeded` / `.payment_failed` / `.requires_action` is the authoritative signal — never poll, never trust the client.
- The BullMQ job is a _trigger_, not a decision-maker: it re-reads booking state and exits if the balance is already settled.

## Security review corrections (2026-07-31)

A security review of the first draft found three under-specified areas where the gap itself invites the insecure implementation. Folded in rather than left to whoever builds this.

### The SCA-recovery link is a bearer credential to a page that charges a card

The draft said only "send the guest a magic link." That is not a specification, and the obvious reading collides with ADR 0005: a 15-minute TTL is wrong for a dunning email someone opens the next morning, and stretching it produces a long-lived unauthenticated credential to a payment page.

Binding rules:

- **Single-use, and bound to `(booking_id, payment_intent_id)`** — not to the guest generally. Replaying it after settlement must be inert, not a second charge attempt.
- **TTL ≤ 24h**, deliberately longer than ADR 0005's 15 minutes because the use case is a scheduled dunning email, not an interactive login. Record that divergence where the token is issued.
- **Delivered as a path segment or POST body, never a query parameter.** Query strings end up in logs, referrers, and (before the scrubbing added in `services/api/src/observability.ts`) Sentry.
- **Rate-limited per booking**, and the page shows only what is needed to authorize — amount and card last4 — not the full booking record. The link travels by email and gets forwarded; treat everything it reveals as public to whoever holds it.

### "Idempotency keys on every charge attempt" was underspecified in the way that permits double-charging

Stripe's idempotency only protects you when both attempts derive the **same** key. The draft never said what the key derives from, and a per-attempt UUID — the natural implementation — makes two concurrent requests look distinct to Stripe and charges the guest twice.

- **Key derivation is fixed:** `hash(booking_id, 'balance', dunning_attempt_number)`. Same logical attempt ⇒ same key, always.
- **The state check must be a conditional write**, not a read followed by a call: `UPDATE payments SET status='charging' WHERE booking_id=$1 AND status='balance_pending' RETURNING …`, and only proceed if a row came back. The draft's "job re-reads booking state and exits if already settled" is check-then-act and races a late webhook.
- **Stripe idempotency keys expire after 24 hours**, so the +3d and +7d dunning rungs are not covered by Stripe at all. The database guard carries that weight alone, which is precisely why it must be a conditional write.

### Quote immutability must anchor to what the guest saw, not to what we stored

`deposit + balance == stored total` proves internal consistency, not honesty. The gap is between render and submit: if the booking POST carries the price — or anything we re-derive it from — a guest can submit a cheaper quote than the page displayed.

- The server issues a **signed, server-persisted quote id** at render time.
- The booking POST references that id and **carries no money fields at all**.
- The server recomputes from the stored quote and rejects on expiry.

That is the property the invariant test should assert. It is also the only version of MRT-15-P1-08 that actually holds.

### Email normalization is a prerequisite

The Stripe Customer is keyed to the guest email. Two case variants would otherwise produce two Customers, or attach a new booking's saved payment method to a record the guest didn't intend. Handled in migration `0002` (unique on `lower(email)`) plus `normalizeEmail` on the write path — but it is load-bearing for this ADR, not incidental.

## Open before build

- Card-only for v1, or does OXXO/MercadoPago ship in Phase 2? (Blocks the voucher-path decision above.)
- Dunning ladder timing — the +1/+3/+7 schedule above is a starting proposal, not a researched one.
- Whether a failed balance charge past arrival date has any automated consequence at all, or is purely an owner conversation.
