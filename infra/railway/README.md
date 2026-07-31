# Railway configuration

Maki runs as a single Railway project with four services: `web`, `api`, `postgres`, `redis`. Configure via the Railway dashboard; each app service also carries a `railway.toml` (`apps/web/railway.toml`, `services/api/railway.toml`) that pins the build + deploy config in-repo.

**Status: provisioned 2026-07-31.** The project exists and both services are live — this is now the runbook for reproducing or rebuilding it, not a first-time-only checklist.

|         |                                                                           |
| ------- | ------------------------------------------------------------------------- |
| Project | `inspiring-learning` (**rename to `maki-tulum`** — Railway auto-named it) |
| web     | https://web-production-66562.up.railway.app                               |
| api     | https://api-production-b61ac.up.railway.app                               |

Services are pointed at their Dockerfiles with a `RAILWAY_DOCKERFILE_PATH` service variable rather than config-as-code, because the CLI has no flag to set the config path and each service needs a different Dockerfile from the same repo root. The `railway.toml` files are therefore **not currently read** — healthcheck paths and restart policy need setting in the dashboard.

## Services

| Service    | Source                    | Healthcheck      | Notes                                                     |
| ---------- | ------------------------- | ---------------- | --------------------------------------------------------- |
| `web`      | `apps/web/Dockerfile`     | `/healthz` (200) | `NEXT_PUBLIC_*` set as **build variables**, never runtime |
| `api`      | `services/api/Dockerfile` | `/healthz` (200) | Backend API; also exposes `/readyz` (checks DB + Redis)   |
| `postgres` | Railway plugin            | n/a              | Connection string injected as `DATABASE_URL`              |
| `redis`    | Railway plugin            | n/a              | Connection string injected as `REDIS_URL`                 |

Both healthcheck paths are real routes, confirmed against source: `apps/web/app/healthz/route.ts` and `services/api/src/routes/health.ts`. `api`'s `/readyz` also exists (`services/api/src/routes/health.ts`) but Railway's own healthcheck should stay pointed at `/healthz` (liveness) — `/readyz` is for the post-deploy smoke job (`scripts/smoke.ts`), not container restart decisions, since a transient DB blip shouldn't cause Railway to cycle a healthy process.

## First-time setup (ordered)

Run these once, in order, from the repo root.

1. **Install the Railway CLI** and authenticate: `railway login`.
2. **Create the project**: `railway init` (or via dashboard) → name it `maki-tulum`. Note the project ID — replace `<PLACEHOLDER: RAILWAY_PROJECT_ID>` below once known.
3. **Link the repo root to the project**: `railway link`. Run this from the repo root, never from `~` — linking from the wrong directory causes `railway up` to scan unrelated projects (Civion Safe lesson).
4. **Add the `postgres` plugin.** Railway provisions it and injects `DATABASE_URL` automatically into services you attach it to.
5. **Add the `redis` plugin.** Same — injects `REDIS_URL`.
6. **Create the `api` service** from `services/api/Dockerfile`:
   - Build: Dockerfile builder, `dockerfilePath = services/api/Dockerfile` (already set in `services/api/railway.toml`).
   - Attach `postgres` and `redis` plugin references so `DATABASE_URL` / `REDIS_URL` populate.
   - Set healthcheck path to `/healthz` explicitly in the Railway dashboard (Settings → Deploy → Healthcheck Path) even though `railway.toml` declares it — confirm the dashboard picked it up after first deploy.
   - Set RUNTIME env vars (see table below).
7. **Create the `web` service** from `apps/web/Dockerfile`:
   - Build: Dockerfile builder, `dockerfilePath = apps/web/Dockerfile`.
   - Set BUILD variables (see table below) — **this is the step most likely to be gotten wrong**, see the callout after the table.
   - Set healthcheck path to `/healthz`.
8. **First deploy**: `railway up --detach` for each service, then immediately `railway logs` — `--detach` returns success even when the build is failing, so a missing `railway logs` check is a false-green (Civion Safe lesson).
9. **Apply migrations against the Railway Postgres** — nothing does this automatically:

   **`railway run` does not work for this.** It injects the service's own
   `DATABASE_URL`, which points at `postgres.railway.internal` — private
   networking, unreachable from a laptop. Use the Postgres service's public
   proxy URL instead:

   ```bash
   PUB=$(railway variables --service Postgres --json | jq -r .DATABASE_PUBLIC_URL)
   cd services/api && DATABASE_URL="$PUB" npx drizzle-kit migrate
   ```

   Verify it took, rather than trusting the command's exit code:

   ```bash
   docker run --rm -e PGURL="$PUB" postgres:16-alpine psql "$PGURL" -c '\dt'
   # expect: accounts, users, account_memberships, properties
   ```

   Until Phase 2 no handler queries the database, so a missed migration looks
   fine — `/healthz` passes and `/readyz` only runs `select 1`, which succeeds
   against an empty schema. It surfaces as the first booking endpoint 500ing.
   Run this before wiring DNS, not after.

   **Migrations are a deliberate manual step, not a release hook.** A migration
   that runs automatically on every deploy will eventually run a destructive one
   during a rollback. Revisit when there is a staging environment to rehearse in.

10. **Wire DNS** (see DNS section below) once the first deploy is healthy.
11. **Set the CI staging variables** (`STAGING_WEB_URL`, `STAGING_API_URL`) in GitHub → repo Settings → Secrets and variables → Actions → Variables, once `staging.makitulum.com` / `api.staging.makitulum.com` resolve. This turns on the `smoke` job in `.github/workflows/ci.yml` — it no-ops until these are set.
12. **Run `pnpm check-env`** against the real Railway env var list before the first production promotion — it greps the codebase for `process.env` references and flags anything undeclared or misnamed.

## BUILD-time vs RUNTIME variables

This is the single most common Railway mistake on this stack (Civion Safe lesson, repeated in `CLAUDE.md`): **`NEXT_PUBLIC_*` values are inlined into the JS bundle at build time.** Setting them as Railway "runtime" variables does nothing — the code that reads `process.env.NEXT_PUBLIC_X` doesn't exist anymore by the time the container runs; it's already been replaced with whatever was present (or `undefined`) when `pnpm build` ran. Changing a `NEXT_PUBLIC_*` value requires a **rebuild**, not just a redeploy/restart.

| Variable                                        | Service | Scope     | Notes                                                                                   |
| ----------------------------------------------- | ------- | --------- | --------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL`                           | web     | **BUILD** | e.g. `https://api.makitulum.com` (prod) / `https://api.staging.makitulum.com` (staging) |
| `NEXT_PUBLIC_SITE_URL`                          | web     | **BUILD** | canonical/hreflang base URL                                                             |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`                  | web     | **BUILD** | optional                                                                                |
| `NEXT_PUBLIC_SENTRY_DSN`                        | web     | **BUILD** | optional                                                                                |
| `NODE_ENV`                                      | both    | runtime   | `production`                                                                            |
| `APP_ENV`                                       | both    | runtime   | `staging` \| `production`                                                               |
| `PORT`                                          | api     | runtime   | Railway injects this; don't hardcode                                                    |
| `DATABASE_URL`                                  | api     | runtime   | injected by the `postgres` plugin                                                       |
| `REDIS_URL`                                     | api     | runtime   | injected by the `redis` plugin                                                          |
| `JWT_PRIVATE_KEY` / `JWT_PUBLIC_KEY`            | api     | runtime   | real keys, not the dev placeholders in `.env.example`                                   |
| `CORS_ORIGINS`                                  | api     | runtime   | comma-separated. **Required** — see callout below                                       |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET`   | api     | runtime   | required once payments land; optional pre-Phase-2                                       |
| `HOSTAWAY_CLIENT_ID` / `HOSTAWAY_CLIENT_SECRET` | api     | runtime   | optional pre-channel-manager                                                            |
| `BREVO_API_KEY`                                 | api     | runtime   | transactional email + WhatsApp (ADR 0012)                                               |
| `SENTRY_DSN`                                    | api     | runtime   | optional                                                                                |

In the Railway dashboard: web service → Variables tab → toggle each `NEXT_PUBLIC_*` entry to "Build Variable" (not the default "Service Variable"). Confirm by triggering a rebuild and checking the deployed bundle actually contains the new value (`curl` the page and grep, or check `view-source`) — a variable saved as runtime-only will silently produce `undefined` in the client bundle with no build error.

### `CORS_ORIGINS` fails closed

The api **will not start** if `CORS_ORIGINS` resolves to an empty list while `APP_ENV` is `staging` or `production`. If a deploy dies with `CORS_ORIGINS is empty for APP_ENV=…`, that is the intended behaviour, not a bug.

Two ways to hit it: leaving the variable unset (it defaults to empty), or setting it to a loopback-only value in production, which the loopback filter then strips to nothing. Set it to the real web origin — `https://makitulum.com` in production, `https://staging.makitulum.com` in staging.

This is deliberate. The previous code fell back to reflecting whatever `Origin` the caller sent while `credentials: true` was set, so a one-line misconfiguration silently became allow-any-origin. Refusing to boot is the safe direction.

## DNS records

Point these at the Railway-issued targets shown in each service's Settings → Networking → Custom Domain (Railway gives you the exact CNAME target per service after you add the domain — copy it from there, don't guess):

| Record                      | Type             | Target                                                 | Points to                 |
| --------------------------- | ---------------- | ------------------------------------------------------ | ------------------------- |
| `makitulum.com` (apex)      | ALIAS/ANAME or A | `<PLACEHOLDER: Railway-issued target for web prod>`    | `web` service, production |
| `api.makitulum.com`         | CNAME            | `<PLACEHOLDER: Railway-issued target for api prod>`    | `api` service, production |
| `staging.makitulum.com`     | CNAME            | `<PLACEHOLDER: Railway-issued target for web staging>` | `web` service, staging    |
| `api.staging.makitulum.com` | CNAME            | `<PLACEHOLDER: Railway-issued target for api staging>` | `api` service, staging    |

Apex domains can't use CNAME per DNS spec — use your registrar/DNS provider's ALIAS, ANAME, or flattened-CNAME equivalent (Cloudflare: "CNAME flattening" is automatic; other providers vary). Add each domain in the Railway dashboard first — Railway won't issue a TLS cert or give you a target until the domain is attached to the service.

## Environments

- **staging** — auto-deploys from `main`. Domain: `staging.makitulum.com` (web) + `api.staging.makitulum.com` (api).
- **production** — manual promote (or auto after staging smoke passes). Domain: `makitulum.com` + `api.makitulum.com`.

## Promotion flow

```
PR → preview deploy (Railway) → smoke E2E → merge to main →
auto-deploy staging → CI `smoke` job hits STAGING_WEB_URL / STAGING_API_URL →
manual smoke sign-off → promote to production
```

## Operational guardrails (from Civion Safe lessons)

1. **Run `railway link` from the repo root**, never from `~`. Wrong path causes `railway up` to scan unrelated projects.
2. **`NEXT_PUBLIC_*` variables are build-time only** — see the callout above. This is the #1 recurring mistake.
3. **Never use `:latest` or a floating tag for Docker base images.** Pin by SHA digest (`apps/web/Dockerfile`, `services/api/Dockerfile`, `infra/docker/docker-compose.yml` all do this).
4. **`railway up --detach` returns success even when the build is failing.** Always run `railway logs` afterward to verify.
5. **Healthcheck path must match an actual route.** Both `web` and `api` expose `/healthz`; configure Railway's healthcheck path explicitly in the dashboard, don't rely on `railway.toml` alone for the first deploy.
6. **Env var names must match code exactly.** Run `pnpm check-env` before deploying — it greps the codebase and compares against the manifest in `scripts/check-env.ts`.
7. **CORS allowlist is environment-scoped.** Production excludes any `localhost` origin; staging accepts the staging web domain only.
8. **`scripts/smoke.ts` is dependency-free** (Node 22 global `fetch`) so it runs identically in CI and from a laptop: `pnpm exec tsx scripts/smoke.ts https://staging.makitulum.com`.

## What Felix has to do by hand

Nothing here can be scripted or pre-filled without a real Railway account and DNS access:

- Create the Railway project and the four services (steps 1–8 above).
- Toggle each `NEXT_PUBLIC_*` variable to "Build Variable" in the web service's dashboard — this is a manual per-variable dashboard setting, not something `railway.toml` can express.
- Add the custom domains in the Railway dashboard and copy the real CNAME/ALIAS targets it issues into your DNS provider.
- Set `STAGING_WEB_URL` / `STAGING_API_URL` as GitHub Actions repository **variables** once staging DNS resolves, to turn on the CI `smoke` job.
- Provide real values for `JWT_PRIVATE_KEY`/`JWT_PUBLIC_KEY`, `STRIPE_*`, `BREVO_API_KEY`, `SENTRY_DSN` in Railway — none of these can be generated or guessed safely.
