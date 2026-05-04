# ADR 0006 — JWT in httpOnly cookies (web), Keychain/Keystore (native)

- **Date:** 2026-05-04
- **Status:** accepted
- **Context:** Auth tokens have to live somewhere on the client. Civion Safe accepted localStorage as a pilot risk and learned what that means (XSS-readable tokens, 24h JWT lifetime, no revocation, password-reset handler scanning all rows — `lessons-learned.md` §Auth, multiple 2026-03-29 entries). We're not repeating that.
- **Decision:**
  1. **Web** stores JWTs in **httpOnly, Secure, SameSite=Lax cookies** scoped to the API domain.
  2. **Native** (when added) stores JWTs in iOS Keychain / Android Keystore.
  3. Tokens come in **two parts**: a short-lived **access token** (15 minutes) signed with RS256, and a **rotating refresh token** (30 days, single-use) stored hashed in Postgres with an indexed lookup column.
  4. **Sign-out** revokes the refresh token (DB delete) and clears the cookies.
  5. **A Redis-backed denylist** (TTL = remaining access-token life) catches active access tokens that need immediate revocation (e.g., user reports compromise).
  6. The API doesn't know whether a request came from web (cookie) or native (Authorization header) — both paths land in the same JWT verifier middleware.
- **Consequences:**
  - JWT is unreachable from JavaScript on the web, so XSS can't exfiltrate the session.
  - Access-token theft has at most a 15-minute attack window.
  - Refresh-token rotation invalidates an older refresh as soon as a newer one is issued, so a stolen refresh can be detected (replay = both tokens trying to use the same parent).
  - One sign-out revokes everything; the denylist gives immediate coverage for the access token.
  - We accept the cost: a refresh table, a cookie-management abstraction, and CSRF protection on cookie-authed POST endpoints.
  - Multi-domain (`makitulum.com` + `api.makitulum.com` + `admin.makitulum.com`) means cookies are scoped to `.makitulum.com` and the API verifies the `Origin`/`Referer` matches an allowlisted host on state-changing requests.
- **Alternatives considered:**
  - **Tokens in localStorage** — explicitly rejected. Civion accepted this as pilot risk and the lesson is captured.
  - **Tokens in non-httpOnly cookies** — defeats the purpose. Rejected.
  - **Single long-lived JWT, no refresh** — Civion's "24h JWT with no revocation" lesson. Rejected.
  - **Server-side sessions only (no JWT)** — would work for web but doesn't extend cleanly to native and forces every request to hit a session store. Rejected.

## Implementation notes (for Phase 3)

- `services/api/src/lib/auth.ts` exposes `signAccess()`, `signRefresh()`, `verifyAccess()`, `rotateRefresh()`, `revokeRefresh()`.
- Cookie helpers live in `services/api/src/middleware/auth.ts`. Web routes that need auth read the cookie; clients with an `Authorization: Bearer` header are accepted equally (native-shaped requests).
- CSRF: cookie-authed mutating endpoints check a double-submit token in a custom header (`X-CSRF`). Native requests skip this — they're Bearer-authed and not vulnerable to CSRF.
- RS256 keypair generated once, public key shipped to clients that need to verify (e.g., a future OpenAPI-described JWT-aware gateway). Private key in Railway env (`JWT_PRIVATE_KEY`).
- Test fakes in `services/api/src/lib/auth-fake.ts` for integration tests.
