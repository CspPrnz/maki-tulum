# 2026-07-15 — Dev-practices review

## State

No product work this session. Phase 1A is still the last shipped milestone — see [`../backlog/TODO.MD`](../backlog/TODO.MD) Status Overview for current state and next actionable items.

## What happened

Audited the project against `civion-safe` (a sibling project with a more mature AI-agent-assisted dev process) to see what was worth porting. Findings:

- No red-teaming or adversarial critique has actually been run against `idea-v3.md` or `implementation-plan.md` yet. `idea-v2.md` (Codex-authored) was strategic input merged pre-code, not a critique of finished work. The persona-UAT process in `implementation-plan.md` §7.6 is scheduled for end of Phase 3 — too late to catch cheap-to-fix assumptions.
- Ported from civion-safe: this handoff mechanism, an ADR template file (`../adrs/_template.md`), and a warn-only CI doc-discipline check.
- Deliberately not ported (disproportionate for current scale): multi-agent orchestration protocol, weekly dev-journal cron, drift-cron, a formal `CONTEXT.md` invariants doc, backlog-ingest intake skill. Logged in TODO.MD under "Deferred process improvements" with a phase to reconsider each at.
- A Codex red-team prompt targeting `idea-v3.md` §13/§15 and `implementation-plan.md` was drafted and handed to Felix to run externally (not run by Claude — Codex is the tool of record for this kind of adversarial pass per project convention).

## Next move

- Felix to run the drafted red-team prompt through Codex; file findings as TODOs and lessons-learned rows per CLAUDE.md rule 7.
- Otherwise, resume wherever TODO.MD's "Remaining (next session — Felix-side)" list left off — Drizzle/DB schema and Railway provisioning are the next unblocked items.

## Suggested skills

None used this session — this was Explore-agent research + direct doc edits.
