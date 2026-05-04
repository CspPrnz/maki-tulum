# ADR 0012 — Brevo as the transactional email provider

- **Date:** 2026-05-04
- **Status:** accepted
- **Context:** From Phase 2 onwards we send transactional email — booking confirmations, balance-due reminders, post-stay review prompts, and (per ADR 0005) magic-link auth tokens. Magic-link delivery is auth-critical: a delayed or missed email is a failed login. The two short-listed providers were Postmark (best deliverability reputation) and Brevo (formerly Sendinblue, France-based, larger free tier, multi-channel — email + SMS + WhatsApp under one account).
- **Decision:** **Brevo.**
- **Consequences:**
  - **Multi-channel under one vendor.** When WhatsApp Business goes live in Phase 4 (per `implementation-plan.md` §2 / B10), Brevo's WhatsApp channel is already there. We avoid stitching together Postmark + Twilio + a separate SMS vendor.
  - **EU-based provider.** GDPR posture is cleaner; data residency is in EU by default. Useful given DACH guests in our primary ICP.
  - **Generous free tier** for our volume. Free transactional tier covers ~300 emails/day which is more than a 10-villa compound will ever send.
  - **Trade-off accepted:** Postmark has a stronger reputation for **inbox placement** specifically on transactional traffic — there's a small but real risk Brevo lands in spam more often, especially for first-time recipients of magic links. Mitigated by:
    - Setting up SPF/DKIM/DMARC on `mail.makitulum.com` from day one.
    - Sending magic links from a recognizable address (e.g., `hi@makitulum.com`) with a real reply-to.
    - Monitoring delivery rates from Brevo's dashboard; if magic-link delivery drops below 99%, escalate to Postmark for auth-only and keep Brevo for marketing/post-stay.
  - **Single vendor dependency for auth.** If Brevo has an outage, magic-link login is down. Mitigated by an alert on `auth/request-link → email-sent` ratio dropping; manual workaround is admin sending a sign-in link via WhatsApp.
- **Alternatives considered:**
  - **Postmark.** Better inbox placement for transactional, but only email — we'd need Twilio separately for WhatsApp, doubling vendor ops.
  - **AWS SES.** Cheaper at scale but worse out-of-the-box (no nice templates, no WhatsApp), and we don't have AWS infra otherwise.
  - **Resend.** Modern dev experience but transactional-only, no WhatsApp, smaller maturity track record.
  - **MailerSend / Mailgun.** Comparable to Brevo without the EU + multi-channel angle.

## Implementation notes (Phase 2+)

- Adapter at `services/api/src/adapters/email/brevo.ts` implementing the `EmailProvider` interface (per `implementation-plan.md` §5). `fake.ts` stays in place for tests.
- Templates managed in code (TS template literals or React Email components) — not in the Brevo dashboard. Reason: templates need to be reviewable in PRs and translated into all three locales (EN/ES/DE) in the same commit.
- Set up domain auth (SPF, DKIM, DMARC) on `mail.makitulum.com` before sending the first production email.
- Add a CI test that every email template renders in EN/ES/DE without missing keys.
- Brevo API key in Railway env as `BREVO_API_KEY`. Add to `packages/config/env.ts` schema and `scripts/check-env.ts` manifest before first send.

## Operational

- A `delivery_rate < 0.99` alert on magic-link sends (Sentry custom metric) triggers a manual review.
- Quarterly review: confirm Brevo is still the right call given any deliverability incidents.
- ADR 0005 + this ADR are bound — if magic-link delivery becomes unreliable, both ADRs need to be revisited together (e.g., a fallback to password-based auth, or a switch to Postmark for auth-only).
