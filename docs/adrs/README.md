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

- [0001 — TypeScript on the backend (Hono), not Go](0001-typescript-backend.md) · accepted
- [0002 — Monorepo with pnpm + Turbo](0002-monorepo-pnpm-turbo.md) · accepted
- [0003 — Railway over Fly / Render / AWS](0003-railway-deployment.md) · accepted
- [0004 — Channel manager: paused, pending revisit at Phase 3](0004-channel-manager-paused.md) · **deferred** (Hosthub vs. Hostaway research notes inside)
- [0005 — Magic-link first, password optional](0005-magic-link-first-auth.md) · accepted
- [0006 — JWT in httpOnly cookies (web), Keychain/Keystore (native)](0006-jwt-httponly-cookies.md) · accepted
- [0007 — Tenant-scoped schema from day one](0007-tenant-scoped-schema.md) · accepted
- [0008 — No Postgres RLS dependency; defense in depth](0008-no-rls-dependency.md) · accepted
- [0009 — OpenAPI spec generated from Zod, not hand-maintained](0009-openapi-via-zod.md) · accepted
- [0010 — Admin in a separate Next.js app at admin.makitulum.com, behind Cloudflare Access](0010-admin-as-separate-app.md) · accepted (**supersedes earlier "fold under /admin" guidance**)
- [0011 — Drizzle ORM + drizzle-kit migrations](0011-drizzle-orm-migrations.md) · accepted

## Pending / future ADRs

These haven't been written yet and shouldn't be pre-emptively. Write each at the moment of decision.

- **0012 — Email provider:** Postmark vs. Brevo. Decide at Phase 1 kickoff.
- **0013 — DB host:** Railway-managed Postgres vs. Neon. Decide at Phase 0 finish.
- **0014 — Guest pre-arrival app:** Enso Connect vs. custom. Decide at Phase 4 kickoff.
- **0015 — Channel manager (when 0004 unpauses):** Hosthub vs. Hostaway vs. Hospitable.

When a pending ADR is written, move its bullet up to the Index above and replace the bullet with a link.
