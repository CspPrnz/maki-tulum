# Architecture Decision Records

> One file per significant decision: `NNNN-slug.md` (zero-padded, numbered globally from 0001).
>
> Write an ADR when: a decision is non-obvious, a future maintainer would reasonably question it, or you've rejected a plausible alternative. Don't write one when: the decision is obvious from the code or from documented best practices.

## Template

```markdown
# ADR NNNN — <title>

- **Date:** YYYY-MM-DD
- **Status:** proposed | accepted | deprecated | superseded by ADR-MMMM
- **Context:** What situation led to this decision?
- **Decision:** What did we decide?
- **Consequences:** What follows — both good and bad?
- **Alternatives considered:** What else did we look at, and why did we not pick them?
```

## Index

- [0001 — TypeScript on the backend (Hono), not Go](0001-typescript-backend.md)
- [0002 — Monorepo with pnpm + Turbo](0002-monorepo-pnpm-turbo.md)
- [0003 — Railway over Fly / Render / AWS](0003-railway-deployment.md)
- *0004 — Buy channel manager (Hostaway), don't build* — pending
- *0005 — Magic-link first, password optional* — pending
- *0006 — JWT in httpOnly cookies, not localStorage* — pending
- *0007 — Tenant-scoped schema from day one* — pending
- *0008 — No Postgres RLS dependency for isolation* — pending
- *0009 — OpenAPI spec via @hono/zod-openapi (generated)* — pending
- *0010 — Admin under /admin, not a separate app* — pending

## Candidate ADRs for Phase 0

From `implementation-plan.md` Appendix:

1. TypeScript on the backend (Hono), not Go.
2. Monorepo with pnpm + Turbo.
3. Railway over Fly / Render / AWS.
4. Buy channel manager (Hostaway default), don't build.
5. Magic-link first, password optional.
6. JWT in httpOnly cookies (web), not localStorage.
7. Tenant-scoped schema from day one.
8. No Postgres RLS dependency for isolation.
9. OpenAPI spec via `@hono/zod-openapi` (generated, not hand-maintained).
10. Admin under `/admin`, not a separate app.
