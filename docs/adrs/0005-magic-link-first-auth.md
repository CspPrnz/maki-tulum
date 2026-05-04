# ADR 0005 — Magic-link first, password optional

- **Date:** 2026-05-04
- **Status:** accepted
- **Context:** Guest auth is needed from Phase 3 (account area, my-bookings, rebook). Owner / manager / housekeeping auth is needed for the admin app. We have to pick a primary mechanism. Civion Safe used password auth and accumulated the expected long tail of issues: bcrypt migration for legacy users, brute-force rate-limiting tuning, password-reset rate-limiting tuning, indexed-token lookups to avoid O(n) scans, leaked-password risk, support for "I forgot which email I used."
- **Decision:** **Magic-link is the primary auth mechanism.** A guest enters their email, we email a one-time, signed, short-lived link (15-min TTL). Clicking the link mints a JWT (15-min access + 30-day rotating refresh, see ADR 0006) and signs them in. Passwords are an *optional* upgrade users can add later if they want; they're never required.
- **Consequences:**
  - **Less support load.** No "forgot password" flow, no password-reset emails, no password-strength UI, no breach-monitoring obligation.
  - **Better security posture by default.** No password to leak; no credential stuffing surface.
  - **Email deliverability becomes auth-critical.** We rely on Postmark (transactional, high reputation) for the magic-link email. Email failure = login failure.
  - **Slightly worse for repeat power-users on shared devices.** Mitigated by remembering the device for 30 days via the refresh token.
  - **Owners / managers / housekeeping use the same flow.** No separate auth path. Role is on the user record.
  - **Audit log captures every magic-link mint and consume.** A consumed link is single-use, expires immediately on use, and is revocable from the admin app.
- **Alternatives considered:**
  - **Password-only**: rejected. Civion already taught us the support cost.
  - **Password + magic-link both first-class**: rejected. Two flows means two attack surfaces and double the UI work; magic-link first achieves 95% of the password use case.
  - **OAuth (Google / Apple sign-in)**: deferred. Useful for a v2 "sign in with Apple" if we want lower friction on iOS later. Doesn't replace email auth; supplements it.
  - **WebAuthn / passkeys**: best-in-class but the conversion-rate impact for travelers booking a one-off villa is unproven. Reconsider when iOS / Android apps land.

## Implementation notes (for Phase 3)

- One-time tokens stored hashed in Postgres with an indexed lookup key (the first 16 chars, unhashed) — Civion lesson: never iterate all rows for token verification.
- Tokens are single-use and have a 15-minute TTL.
- Rate-limit `/auth/request-link` at 10/hour per IP and 5/hour per email.
- Magic-link emails sent via Postmark. Templates live in `services/api/src/adapters/email/`.
- Optional password add-on: a logged-in user can set a password from `/account/security`. If set, future logins offer both flows.
- ADR 0006 covers token storage + refresh.
