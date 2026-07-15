# Maki Tulum — Lessons Learned

> Append a row whenever something bites: a bug, a miswrite, a red-team finding, a debugging session > 30 minutes, a deployment surprise. Preventive measure must be **actionable**.
>
> Synced upstream to `/Users/felix/Projects/innovation-factory/lessons-learned.md` via `/sync-inno-factory-knowledge`.

---

| Date | Issue | Root cause | Preventive measure |
|------|-------|------------|--------------------|
| 2026-05-04 | Vitest fails to resolve `server-only` when testing server modules | `server-only` is a Next.js-provided virtual module; vitest runs outside the Next runtime so the package isn't installed | Alias `server-only` to a no-op shim in `vitest.config.ts` (`apps/web/test/server-only-shim.ts`); makes server-only modules unit-testable |
| 2026-05-04 | Vite static analyzer rejects ``import(`../locales/${locale}.json`)`` in `@maki/i18n` | Template-string dynamic imports must start with `./` and stay within one directory; cross-dir paths break the analyzer | Use a static map of pre-imported modules (`const LOCALE_MAP: Record<Locale, Translations> = { en, es, de }`); also gives us static bundling and zero runtime cost |
| 2026-05-04 | Next.js `next build` failed with "Module not found: Can't resolve './components/Container.js'" in `@maki/ui` | Two compounding issues: (1) workspace packages with `"main": "./src/index.ts"` aren't transpiled by Next webpack by default; (2) `.js` re-exports of `.tsx` source aren't auto-resolved | Add `transpilePackages: ['@maki/ui', '@maki/i18n', '@maki/types', '@maki/config']` to `next.config.mjs`, and drop `.js` extensions from re-exports inside workspace packages (Bundler resolution makes them optional) |
| 2026-05-04 | `services/api` typecheck error TS6059: "File ... is not under 'rootDir'" after aliasing `@maki/config` to source | When TypeScript follows path/workspace resolution into a sibling package's source files, those files fall outside `rootDir: "./src"` and TS treats it as a project-structure violation | Drop `rootDir` from `services/api/tsconfig.json`. `outDir` alone controls build output; without `rootDir`, TS computes the common ancestor and accepts cross-package imports without complaint |
| 2026-05-04 | TS7006 "Parameter 'o' implicitly has an 'any' type" in Hono CORS callback | Hono's `cors({ origin })` accepts a union including a function, and TS can't infer the param type when the function form is used inside a ternary | Always type callback params explicitly under `noImplicitAny` — e.g. `(o: string) => o ?? '*'` |

---

## Meta-lessons (about how we built this project itself)

> Sourced from the first Codex red-team pass ([`docs/backlog/plans/codex-red-team.md`](backlog/plans/codex-red-team.md), 2026-07-15) — all 6 proposed meta-lessons reviewed and accepted.

| Date | Lesson | Preventive measure |
|------|--------|--------------------|
| 2026-07-15 | A deferred vendor decision is not non-blocking when it defines the domain model (channel manager deferred past the point it shapes the availability schema — MRT-15-P0-02) | Add a dependency gate requiring vendor proof-of-capability before schema/contract freeze |
| 2026-07-15 | An adapter is not evidence that vendors are interchangeable (MRT-15-P0-03) | Require a capability matrix and sandbox contract suite before promising a vendor swap is low-cost |
| 2026-07-15 | Privacy decisions must precede data-schema and lifecycle design, not follow it (MRT-15-P0-05) | Require a data map, lawful-basis matrix, and deletion/retention design before any new guest-data collection |
| 2026-07-15 | Accepted ADRs must trigger a repository-wide contradiction check — ADR 0012 (Brevo) shipped while CLAUDE.md and implementation-plan.md still named Postmark/Twilio (MRT-15-P1-04) | Add a checklist/CI doc scan for superseded provider and architecture choices |
| 2026-07-15 | Conversion features require an explicit anti-pattern invariant, not just a listed don't (MRT-15-P2-01) | Add anti-pattern acceptance checks to every growth/checkout experiment |
| 2026-07-15 | Plans must be reconciled when shipped state changes — implementation-plan.md said "no code yet" after Phase 0/1A had shipped (MRT-15-P2-02) | Make current-state reconciliation a required close-out step for each phase |
