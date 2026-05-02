# ADR 0003 — Railway over Fly / Render / AWS

- **Date:** 2026-05-02
- **Status:** accepted
- **Context:** Felix already runs Civion Safe on Railway and is happy with it. The question is whether Maki should follow or diverge.
- **Decision:** Railway. One project, four services: `web`, `api`, `postgres` (managed), `redis` (managed). PR previews enabled. Production promotion is manual after staging smoke.
- **Consequences:**
  - Familiar territory; Civion Safe's Railway lessons apply directly (NEXT_PUBLIC build args, healthcheck path, `--detach` log verification, env-name drift, etc. — all baked into our Dockerfiles, scripts, and CLAUDE.md).
  - One vendor for compute + DB + Redis simplifies billing and ops.
  - **Vendor lock-in is acceptable** at this scale. If we ever outgrow Railway, the Dockerfiles run anywhere.
  - Railway's free tier won't cover production traffic; budget ~$20–40/mo for staging + production.
- **Alternatives considered:**
  - **Fly.io** — comparable, but no second project on it to amortize learning.
  - **Render** — viable; Railway's PR preview environments are slightly better.
  - **AWS / GCP** — premature complexity. We'd burn weeks on infra for a 1-compound site.
- **Operational guardrails** (from Civion lessons, encoded in `infra/railway/README.md`):
  1. `railway link` from repo root, never from `~`.
  2. `NEXT_PUBLIC_*` are build variables, not runtime.
  3. Pin Docker images by SHA digest, never `:latest`.
  4. `railway up --detach` — always check `railway logs` after.
  5. Healthcheck path must match a real route (`/healthz`).
  6. Env var names match code exactly — `pnpm check-env` audits.
  7. CORS allowlist is environment-scoped; production excludes localhost.
