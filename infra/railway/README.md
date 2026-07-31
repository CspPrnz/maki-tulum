# Railway configuration

Maki runs as a single Railway project with four services. Configure in the Railway dashboard or via `railway.toml` per service.

## Services

| Service    | Source                    | Healthcheck      | Notes                                                     |
| ---------- | ------------------------- | ---------------- | --------------------------------------------------------- |
| `web`      | `apps/web/Dockerfile`     | `/healthz` (200) | `NEXT_PUBLIC_*` set as **build variables**, never runtime |
| `api`      | `services/api/Dockerfile` | `/healthz` (200) | Backend API                                               |
| `postgres` | Railway plugin            | n/a              | Connection string injected as `DATABASE_URL`              |
| `redis`    | Railway plugin            | n/a              | Connection string injected as `REDIS_URL`                 |

## Environments

- **staging** — auto-deploys from `main`. Domain: `staging.makitulum.com` (web) + `api.staging.makitulum.com` (api).
- **production** — manual promote (or auto after staging smoke). Domain: `makitulum.com` + `api.makitulum.com`.

## Operational guardrails (from Civion Safe lessons)

1. **Run `railway link` from the repo root**, never from `~`. Wrong path causes `railway up` to scan unrelated projects.
2. **`NEXT_PUBLIC_*` variables are build-time only** — set them as Railway "build variables", not runtime variables. Next.js inlines them at build.
3. **Never use `:latest` Docker base images**. Pin by SHA digest (visible in `apps/web/Dockerfile`, `services/api/Dockerfile`).
4. **`railway up --detach` returns success even when the build is failing.** CI must run `railway logs` afterward to verify.
5. **Healthcheck path must match an actual route.** Both `web` and `api` expose `/healthz`. Configure Railway's healthcheck path explicitly.
6. **Env var names must match code exactly.** Run `pnpm check-env` before deploying — it greps the codebase and compares against the active Railway env.
7. **CORS allowlist is environment-scoped.** Production excludes any `localhost` origin; staging accepts the staging web domain only.

## Required env (api service)

See `services/api/.env.example`.

## Required build variables (web service)

```
NEXT_PUBLIC_API_URL=https://api.makitulum.com   # production
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=makitulum.com
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
```

## Promotion flow

```
PR → preview deploy (Railway) → smoke E2E → merge to main →
auto-deploy staging → manual smoke → promote to production
```
