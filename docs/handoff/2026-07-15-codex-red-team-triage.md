# 2026-07-15 — Codex red-team triage

## State

Still Phase 1A shipped, nothing new deployed. See [`../backlog/TODO.MD`](../backlog/TODO.MD) Status Overview.

## What happened

Felix ran the Codex red-team prompt drafted in the previous session (`docs/handoff/2026-07-15-dev-practices-review.md`) and logged 15 findings to [`../backlog/plans/codex-red-team.md`](../backlog/plans/codex-red-team.md). Also renamed `docs/tasks/` → `docs/backlog/` (civion-safe convention).

Reviewed the findings for soundness — spot-checked the two governance claims (MRT-15-P1-04, MRT-15-P2-02) directly against the repo and confirmed both: CLAUDE.md/implementation-plan.md did still say Postmark/Twilio despite ADR 0012 accepting Brevo for both channels, and implementation-plan.md's "Current state" did still say "no code yet" despite Phase 0/1A being shipped. All findings judged sound and well-sourced (Stripe docs, Hostaway API docs, INM guidance). No findings rejected.

Actions taken:
- Fixed the `docs/tasks` → `docs/backlog` path rename everywhere it was referenced (CLAUDE.md, implementation-plan.md, ci.yml doc-discipline check).
- Fixed the Brevo/Postmark/Twilio contradiction directly (CLAUDE.md, implementation-plan.md stack table + env vars + open-decisions note) — this was MRT-15-P2-02/P1-04's fix, not just a log entry.
- Reconciled implementation-plan.md's stale "Current state" section.
- Filed the other 10 findings into `docs/backlog/TODO.MD` as a "Phase 2 blockers" section (grouped by ID, one-liner, objective), added the two previously-untracked `idea-v3.md` §15 decisions (legal entity, consent scope) to a new "blocking Phase 2" open-decisions table, and strengthened the Phase 1B German-content checklist item into an explicit gate (MRT-15-P1-03 — this one blocks the *next* phase, not just Phase 2).
- Added all 6 of Codex's proposed meta-lessons to `docs/lessons-learned.md` (was empty).
- Added a `docs/backlog/TODO.MD` "Plans" index section pointing at `plans/codex-red-team.md`.
- Added a Phase-2-gate banner to CLAUDE.md's top state line.

## Next move

- None of this blocks current work. Resume Phase 0 remainder (Drizzle/Railway) or Phase 1B content — just don't push deeper German-language content without doing the SEO validation gate first (see TODO.MD Phase 1B checklist).
- Before Phase 2 kickoff: work through the "Phase 2 blockers" table in TODO.MD, starting with MRT-15-P0-01 (payment capture design is actually broken, not just risky) and MRT-15-P0-02/03 (channel-manager timing).
- `docs/backlog/plans/codex-red-team.md` is a running, append-only log — future red-team passes add a new dated section, don't rewrite this one.

## Suggested skills

None used this session — direct doc review and edits.
