# ADR 0017 — Charge the full amount at booking

- **Date:** 2026-07-31
- **Status:** accepted — **supersedes [ADR 0016](0016-deposit-and-off-session-balance.md)**
- **Context:**

ADR 0016 replaced the unworkable T−30 manual-capture design with a captured deposit plus a separate off-session balance charge. It is correct, and it is a lot of machinery: saved-payment-method consent, an SCA recovery page behind a magic link, a dunning ladder with retries and notifications, a conditional-write guard against double-charging, and an owner escalation path when the ladder runs out.

Felix's call: take 100% at booking instead, and revisit if the split ever becomes worth the complexity.

- **Decision:**

**One payment, captured at booking time.** No deposit/balance split, no scheduled job, no off-session charging, no saved payment method, no dunning.

Everything ADR 0016 said about the _failure_ of the original design still stands and is why we are not doing it: manual capture is an authorization hold that expires in about seven days, so it can never fund a charge 30 days before arrival. The choice here is between "capture the full amount now" and "capture part now, charge the rest later" — and we are choosing the first.

What carries over from ADR 0016 unchanged:

- **The quote is immutable and anchored to what the guest saw.** The server issues a signed, persisted quote id at render time; the booking POST references that id and carries no money fields; the server recomputes from the stored quote and rejects on expiry. This was ADR 0016's P2-C correction and it applies identically here — arguably more cleanly, since there is now exactly one amount to protect.
- **Idempotency on the charge**, with the key derived from the booking rather than the attempt, and the state check written as a conditional update rather than read-then-act.
- **Our ledger is the source of truth**; Stripe is the gateway. Webhooks are authoritative; never poll, never trust the client.
- **Email normalization** before a Stripe Customer is keyed to it (migration `0002`).

- **Consequences:**
  - **Most of Phase 2's payment complexity disappears.** No BullMQ payment job, no dunning ladder, no SCA-recovery magic link — which also removes the bearer-credential-to-a-payment-page risk the security review flagged as P1-A, rather than mitigating it.
  - **The guest is present for the only charge**, so SCA completes interactively. `authentication_required` stops being a background failure mode that needs a recovery path.
  - **Conversion cost, accepted knowingly.** A full charge on a multi-thousand-dollar stay is a bigger ask at the point of decision than 30%. This is the trade-off Felix is buying simplicity with, and it is the thing to watch: if direct bookings underperform OTA conversion at similar price points, revisit before concluding the rest of the funnel is broken.
  - **Cancellation is now entirely about refunds**, since all money is captured. Tiered policies (flex / standard / non-refundable) are refund rules, not capture rules — simpler to reason about, and the refund path must be built in Phase 2 rather than deferred.
  - **Cash-flow timing improves**; the full amount settles at booking rather than 30 days out.
  - **OXXO and SPEI become viable again.** ADR 0016 could not use them because push payments leave no reusable payment method for a later charge. With a single payment at booking that objection disappears — so the payment-method question is now purely about the legal entity (see below), not about the payment design.

- **Alternatives considered:**
  - **ADR 0016's deposit + off-session balance.** Correct, guest-friendlier, and materially more code and operational surface. Superseded, not deleted — if we ever want the split, that document already contains the working design and the security corrections it needs. Reviving it means reviving the magic-link, dunning, and idempotency-derivation requirements together.
  - **Deposit now, balance collected manually by the owner.** Avoids the dunning machinery but moves the work onto a person for every booking. Rejected: it does not scale past a handful of stays and it puts money collection on the critical path of someone's attention.

## Implementation notes (Phase 2)

- Adapter at `services/api/src/adapters/payments/stripe.ts` behind a `PaymentProvider` interface with a fake. Handlers never import the Stripe SDK.
- Test with Stripe test clocks anyway — bookings at 7, 31, 90 and 365 days out, proving the charge, the refund paths per cancellation tier, and reconciliation against the booking ledger.
- Keep the contract test that fails any implementation scheduling a capture against a PaymentIntent whose authorization expires before the scheduled time. It guards a design we are no longer building, which is exactly why it should stay: it is what stops the T−30 idea coming back by accident.
- Cancellation/refund rules are Phase 2 scope now, not deferred.

## Open before build

- Which payment methods ship in v1 — card-only, or card + OXXO/MercadoPago. Now gated on the legal-entity decision alone (see `docs/backlog/plans/legal-entity-brief.md`), since the payment design no longer rules them out.
- Refund windows per cancellation tier, and who can trigger one.
