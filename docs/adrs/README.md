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

- *(none yet)*

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
