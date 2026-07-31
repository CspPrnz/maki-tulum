# 2026-07-31 — Agent harness + WP-1 scoped

## State

Phase 1A still the last shipped milestone; nothing deployed. **CI had never passed** — now fixed locally, unverified on GitHub until the next push. See [`../backlog/TODO.MD`](../backlog/TODO.MD) Status Overview.

## What happened

Felix asked for an overview, for the Innovation Factory ways-of-working to be pulled into this repo, and for a first parallel-agent work package.

**Ported from `innovation-factory/ai-native-delivery.md` §7** (the nine-layer bootstrap): `AGENTS.md` (vendor-neutral mirror, CLAUDE.md wins on conflict), `CONTEXT.md` (domain glossary — parallel agents don't share Felix's context and would otherwise invent synonyms for stay/property/Saneamiento), `.claude/settings.json` (deny/ask/allow ladder, checked in), `.claude/agents/{worker,verifier,security-reviewer}.md` (reviewers have no Edit/Write — the tool scoping _is_ the safety property), `.claude/skills/{grill,orchestrate,handoff}/SKILL.md`, `docs/backlog/plans/_template.md`, and `pnpm verify` as the single gate mirroring CI.

`CLAUDE.md` was trimmed of its shipped-feature narrative (best practice: history goes in handoffs, not the always-loaded header) and gained an Evidence discipline section. Deliberately **not** ported: a Stop-hook — pointless until we run unattended, and it needs the "couldn't run" vs "found a regression" distinction to avoid becoming a false-positive machine. Tracked in TODO.MD.

**The find:** running the new gate immediately went red, which exposed that CI has failed on _every one of the 5 runs_ in this repo's history while the docs said 🟢. `pnpm check-env` exits 1 at CI step 1 — `NEXT_PUBLIC_SITE_URL` was never declared, and the script scanned its own source where a doc comment `process.env.X` read as a phantom var. Nothing after step 1 has ever executed on CI. Fixed both, plus a `pnpm format` pass over 37 files (25 pre-existing — prettier was configured but never enforced because CI died before reaching it). `pnpm verify` now passes clean: 33 tests, 9 routes built. Two lessons logged. Also dropped the Postmark/Twilio env names, which were residue of the ADR-0012 Brevo decision.

**WP-1 scoped**: [`../backlog/plans/wp1-phase0-exit.md`](../backlog/plans/wp1-phase0-exit.md), `status: draft`. Four parallel streams (persistence · integration tests · observability · deploy readiness) with pinned contracts and a non-overlapping file-ownership table. The first migration is deliberately limited to accounts/users/memberships/properties — booking and rate tables stay out until the channel-manager blocker clears (MRT-15-P0-02).

## Next move

Felix to approve or reshape WP-1, then run the `orchestrate` skill on it. Push first so CI's first green run is on record. Streams A/C/D start immediately; B gates on A's schema.

## Suggested skills

`orchestrate` (WP-1 fan-out), then `handoff`. `grill` before Phase 2 — its four P0 blockers are exactly the decisions that step exists to force.
