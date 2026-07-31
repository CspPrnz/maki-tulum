# 2026-07-31 — WP-1 across five parallel streams, plus the harness that ran them

## State

Phase 0 foundations, Phase 1B content, and the agent harness all landed on `feat/wp1-phase0-exit` ([PR #1](https://github.com/CspPrnz/maki-tulum/pull/1)), 11 commits, `pnpm verify` green at 97 tests. **Phase 0's exit criterion is still unmet** — there is no Railway project, so no deployed `/healthz`. See [`../backlog/TODO.MD`](../backlog/TODO.MD).

## What happened

Felix asked for the Innovation Factory ways-of-working ported in, then for Phase 0 closed, Phase 1B content, and the Phase 2 blockers unblocked — orchestrated across parallel Sonnet workers.

**Harness** (from `innovation-factory/ai-native-delivery.md` §7): `AGENTS.md`, `CONTEXT.md`, `.claude/settings.json`, three scoped subagents, three skills, a plan template, and `pnpm verify`. Deliberately skipped the Stop-hook — pointless until we run unattended. This pulled multi-agent orchestration forward from its Phase-3 deferral; TODO.MD records the override.

**Five streams**, contracts pinned in [`../backlog/plans/wp1-phase0-exit.md`](../backlog/plans/wp1-phase0-exit.md) before fan-out: persistence, integration tests, observability, deploy/supply-chain, and Phase 1B content. A sixth produced the channel-manager and legal-entity briefs.

**Three gates were decorative.** CI had failed on every run since Phase 0 because `check-env` died at step one, so nothing after it ever ran. `pnpm lint` could not fail — every script ended in `|| true` and no eslint config existed. And `services/api`'s lint glob never covered `test/`. All three fixed and now real.

**Both review passes found defects in orchestrator-authored code, not the workers'** — see [`../lessons-learned.md`](../lessons-learned.md) for the six new rows. The two that mattered most: `/readyz` crashed the process instead of reporting 503 (unhandled pg pool `'error'`), and `pnpm verify` could never have mirrored CI because nothing migrated CI's fresh container. Both were reproduced before fixing.

**Three of four Phase 2 blockers are now decision-ready** — ADR 0016, the consent data map, the legal-entity brief, the channel-manager capability contract. None are decided.

## Next move

1. **Felix: create the Railway project** (4 services) and paste back URLs + Sentry/Plausible DSNs. [`../../infra/railway/README.md`](../../infra/railway/README.md) is the checklist — note step 9, migrations are a deliberate manual step. This closes Phase 0.
2. **Felix: correct the five `TODO(felix)` invented claims** in the new marketing copy, then mirror into ES/DE. Blocks publishing 1B.
3. **Felix + counsel:** legal entity, then consent scope (the first determines the controller for the second). **Felix:** run the channel-manager sandbox trial. **Felix:** accept or amend ADR 0016.
4. Then Phase 2 booking schema — and not before, because the channel-manager choice defines the inventory model (MRT-15-P0-02).

## Lessons for the next orchestration run

- **Agent worktrees branch from `main`, not from the current branch.** All five started without the harness, the CI fix, and the seams. Recoverable but wasteful — workers re-derived fixed bugs and couldn't run lint. Either land prep on `main` first, or run workers in the shared checkout with tight file scoping (which is what stream B did successfully).
- **Two pinned contracts were wrong** (C2 contradicted ADR 0007; C3 invented an enum that already existed canonically). Both were caught because workers refused to work around them. Check contracts against the ADRs and `packages/types` before fan-out.
- **Subagent definitions load at session start**, so `.claude/agents/*.md` written this session had to be inlined into prompts. They will be first-class next session.

## Suggested skills

`orchestrate` for the next work package, `grill` before Phase 2 — its blockers are exactly the decisions that step exists to force.
