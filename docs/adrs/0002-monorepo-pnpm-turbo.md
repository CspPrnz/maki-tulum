# ADR 0002 — Monorepo with pnpm + Turbo

- **Date:** 2026-05-02
- **Status:** accepted
- **Context:** We have ≥1 service (api), ≥1 app (web), ≥4 shared packages (config, types, i18n, ui), and we plan native apps on the same backend later. Independent repos would cost a lot in coordination; a monorepo is cheap to set up if we pick well.
- **Decision:** **pnpm workspaces** for package linking, **Turbo** for task graph + caching. Workspaces declared in `pnpm-workspace.yaml`; each package owns its `package.json` with `workspace:*` deps.
- **Consequences:**
  - Cross-package changes are a single PR.
  - Turbo caches typecheck/build/test across packages so CI stays under 5 min as the repo grows.
  - We accept the upfront tooling cost (Turbo config, workspace package fields).
- **Alternatives considered:**
  - **npm workspaces + scripts** — works but slower without caching.
  - **Nx** — heavier, more opinionated, more to learn.
  - **Bun workspaces** — faster install but ecosystem maturity isn't there for a 2026-05 production launch.
  - **Polyrepo** — explicitly rejected; coordination cost exceeds any benefit for a 1-team project.
