# ADR 0004 — Channel manager: paused, pending revisit at Phase 3

- **Date:** 2026-05-04
- **Status:** **deferred** — re-decide at Phase 3 kickoff (or whenever a real OTA listing exists to sync)
- **Context:** Maki needs to keep direct, Airbnb, Booking.com, and VRBO calendars in sync to prevent double-bookings. Civion's "direct site is the source of truth" pattern requires push-based sync via a vendor API; iCal polling is too slow for a single-unit operator (1–4 hour drift window is catastrophic).
- **Decision:** **No vendor selected yet.** We don't pay for a channel manager until the project is live and there's a real OTA listing to sync. Implementation work proceeds with a `ChannelManager` interface in `services/api/src/adapters/channel-manager/` and an in-memory fake (`fake.ts`) that satisfies the interface for tests.
- **Consequences:**
  - Phases 0–2 are unblocked — they don't depend on a real channel sync.
  - Phase 3's "Hostaway sync live" goal becomes "channel sync live (vendor TBD)."
  - When we revisit, the adapter pattern means the implementation is a single file, no API contract changes.
  - Risk: if the vendor's API model is fundamentally different from our adapter shape, we eat refactor cost. Mitigation: keep the adapter interface narrow and outcome-shaped (`pushAvailability`, `pushRates`, `listBookings`, `subscribeToWebhooks`) rather than vendor-shaped.

## Candidates being researched

### Hosthub *(Felix has prior experience)*

What we know from public-facing docs:

- Positions itself as channel manager + PMS + AI co-host + booking engine. Claims **200+ channels** and "real-time sync with zero double-booking guarantee."
- Pricing scales with property count ("the more rentals you have, the less you pay per rental"). Standard plan and Pro plan, with Pro adding AI features and percentage-based fees.
- API exists and "exchanges users, rentals, and bookings data" — but the public API spec at https://www.hosthub.com/docs/api/ is essentially a placeholder. Real spec is **gated behind support contact** ([Hosthub API page](https://www.hosthub.com/features/hosthub-api/)).
- **Open questions to resolve at Phase 3:**
  - Does the API support push availability/rates outbound to all four target channels (Airbnb, Booking.com, VRBO, Expedia)?
  - What's the auth model — API keys, OAuth, partner credentials?
  - Are there real-time webhooks for new-booking, cancellation, message, or do we have to poll?
  - What rate limits apply?
  - Is there a sandbox / test environment?
  - Documented integration with Stripe / MercadoPago for direct-channel payments?
  - Pricing at 1–3 properties — is the API access on the Standard plan or Pro-only?
- **Status:** trial / contact required for real evaluation.

### Hostaway *(implementation plan default)*

The previous default in `implementation-plan.md`. Public API is well-documented; supports push availability, rates, listings, message threads. Real-time webhooks. Sandbox available. Trial flow exists. Re-evaluate alongside Hosthub when this ADR unpauses.

### Hospitable *(dark-horse third)*

Comparable feature set, simpler API surface than Hostaway, smaller channel list. Worth a 30-minute look at decision time.

## What to do at Phase 3 kickoff

1. Open trial accounts on **Hosthub** and **Hostaway** (free / refundable). Skip if pricing requires a card on file you don't want to use.
2. For each: confirm the six "open questions" above against real docs (not marketing pages).
3. Build the adapter against the winner. Update this ADR's status to `superseded by ADR-NNNN — channel manager: <vendor>`.

## Alternatives considered (and not chosen)

- **iCal-only sync:** documented in Civion-Safe-class lessons as too slow for single-unit owners. Rejected.
- **Build our own channel manager:** explicitly anti-scope per `idea-v3.md` §6. Rejected.
- **Use Airbnb's official API only:** Airbnb's partner program is gated and slow to onboard. Doesn't cover Booking.com or VRBO. Rejected.

## Sources

- [Hosthub — API page (marketing)](https://www.hosthub.com/features/hosthub-api/)
- [Hosthub — API docs (placeholder)](https://www.hosthub.com/docs/api/)
- [Hosthub — Supported Channels](https://www.hosthub.com/features/supported-channels/) (claims 200+)
- [Hosthub — Channel Manager product](https://www.hosthub.com/products/channel-manager-for-vacation-rentals/)
- [Hosthub — Pricing & feature review (third-party)](https://softwarefinder.com/property-management-software/hosthub)
