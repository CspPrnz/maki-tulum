# ADR 0010 — Admin in a separate Next.js app at `admin.makitulum.com`, behind Cloudflare Access

- **Date:** 2026-05-04
- **Status:** accepted (**supersedes earlier "fold admin under `/admin`" guidance** in `implementation-plan.md` §3.3 and ADR-0010 candidate notes)
- **Context:** The original implementation plan said _"fold admin into `apps/web` under `/admin/_`… split into a separate app only if admin outgrows the public bundle."* That call was made on aesthetic / cost grounds. Felix's prior project at the same domain was hit by sustained malicious traffic targeting the predictable`/admin`and`/wp-admin` paths — bot scanners, credential-stuffing, exploit-of-the-week probes. The marginal cost of a separate admin app is small; the operational and security benefits are real.
- **Decision:** Admin lives in a **separate Next.js app** (`apps/admin`) deployed to a **separate Railway service** at the **separate subdomain `admin.makitulum.com`**, fronted by **Cloudflare Access** (Zero Trust SSO gate). The public site (`apps/web` at `makitulum.com`) does not serve any admin routes and ships no admin code.
- **Consequences:**

  ### What we gain
  - **Different attack surface.** Public bundle never contains admin code. A vulnerability in admin code can't be reached from the public domain at all.
  - **ZTNA before app auth.** Cloudflare Access requires SSO (Google / Apple / one-time-PIN email) **before** the request reaches Railway. Bots scanning `admin.makitulum.com` see Cloudflare's auth wall, not our app. Free tier covers ≤50 users; we have <10.
  - **Separate cookies / origins.** Admin-app session cookies are scoped to `admin.makitulum.com` only. A compromise of the public site doesn't grant admin access.
  - **Tighter security headers** on the admin app (stricter CSP, no third-party analytics, `X-Robots-Tag: noindex`, no preview deployments exposed publicly).
  - **Smaller public bundle.** Marketing site doesn't ship admin chunks.
  - **Different deploy cadence.** We can hold admin while shipping public, and vice versa.

  ### What we pay
  - One more Railway service to provision and budget (≈$5–10/mo more for the admin web service).
  - One more Next.js app to scaffold (~30 min) and keep in sync with shared packages.
  - Cloudflare Access setup (~30 min, free tier, free in operation).
  - Slightly more docs (this ADR, the operational runbook for adding/removing admin users in CF Access).

  ### What this is _not_
  - Not security-through-obscurity. The subdomain is published in DNS; CF Access is the actual gate.
  - Not a replacement for app-layer authz. Roles + permissions still apply inside the admin app — CF Access just keeps strangers off the door.

- **Alternatives considered:**
  - **Same app, `/admin` path** (the previous plan): rejected. Predictable URL invites bot traffic and intermingles attack surfaces.
  - **Same app, randomized path** (`/portal-x9k4`): rejected. Security-through-obscurity alone, and the path leaks via referrer + browser history + accidental sharing.
  - **Separate subdomain, no CF Access**: a real improvement over `/admin` but still leaves the door visible. Adding CF Access is ~30 min of one-time setup for a defense-in-depth win.
  - **VPN / WireGuard / Tailscale gate**: stronger but operationally awkward — housekeeping in Tulum on phones, owners traveling internationally. CF Access gives ~95% of the benefit with ~10% of the friction.
  - **IP allowlist**: too brittle for our roles.

## Repo layout change

```diff
 apps/
   web/                 Public site — marketing + booking + guest area
+  admin/               Admin app — owner/manager/housekeeping/maintenance
 services/
   api/                 Same API serves both (separate origin, same JWT model)
```

Shared `packages/` (`config`, `types`, `i18n`, `ui`) stay shared. The admin app reuses tokens/types/i18n directly.

## Cloudflare Access setup (operational playbook)

To be filled in when admin app lands (Phase 3). Outline:

1. CF: add `admin.makitulum.com` as a CF-proxied DNS record pointing at Railway.
2. CF Zero Trust → Applications → Self-hosted → app name "Maki Admin", domain `admin.makitulum.com`, session 24h.
3. Identity providers: Google (Felix's Workspace) + One-time PIN (housekeeping fallback).
4. Policy: `Allow` if email in `@makitulum.com` group, `Allow` if email in explicit allowlist (housekeeping addresses).
5. Service tokens for any CI / API automation that needs to hit admin endpoints — never put a service token in the browser.
6. Audit log: CF Access logs every authentication attempt; export to our audit-log on a 24h cron later.

## Operational rules

- `apps/admin` is **never** in a Railway preview environment that has a public URL. Preview envs are gated by CF Access too, or they use ephemeral `*.makitulum.com` subdomains that the CF policy covers via wildcard.
- The admin app sets `X-Robots-Tag: noindex, nofollow` on every response.
- The admin app has its own CSP, stricter than the public site's, with no third-party scripts.
- `manager` and `housekeeping` roles get scoped subsets of admin (see ADR-0007 + Phase 3 work) — they don't see anything they don't need.
