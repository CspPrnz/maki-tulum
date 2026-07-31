---
name: orchestrate
description: Run a work package across parallel worker agents — pin contracts, split file ownership, fan out, verify, integrate. Use when a slice of a phase is big enough to parallelize across 3-5 agents.
---

# Orchestrate a work package

You are the **orchestrator**. You own planning, contracts, integration, verification, docs, and the commit. You never delegate accountability for correctness.

## 0. Is this actually parallel?

Skip this skill if the work is one stream. Orchestration overhead only pays off at **3–5 workers**. Under 3, just do it.

## 1. Write the plan file first

`docs/backlog/plans/wpN-slug.md` from [`_template.md`](../../../docs/backlog/plans/_template.md). It must contain, before any agent is spawned:

- **Pinned contracts** — DB schema shapes, repo function signatures, API request/response shapes, env var names, module boundaries. Workers build against the contract, not against each other's code. A contract that isn't written down will be invented differently by four agents.
- **File ownership table** — one row per stream: stream ID, goal, _owned_ paths (exclusive write), _read-only_ paths. **No path appears in two streams' owned sets.** If two streams need the same file, either the orchestrator edits it up front to create the seam, or the streams are merged.
- **Dependency gates** — which stream waits on which artifact, and only that artifact.
- **Acceptance evidence per stream** — the exact commands whose output must appear in the worker's report.
- **Out of scope** — explicit.

Get Felix's OK on the plan before fan-out. An architectural flaw is far cheaper to catch here than in four diffs.

## 2. Prepare the seams

Before spawning: make any shared-file edit yourself (e.g. adding a registration hook in `services/api/src/app.ts` so two streams can plug in without touching the same lines). Commit or at least stage it so workers read a consistent tree.

## 3. Fan out

One `worker` subagent per stream, each given: stream ID, goal, owned file set, pinned contracts, read-only context, acceptance evidence. Give each parallel worker its **own git worktree** (`isolation: "worktree"`) so non-overlap is structural rather than a promise.

Launch independent streams together. A dependent stream waits only for the specific artifact it needs.

## 4. Bound the run

- Kill or reassign a worker after ~**3 failed iterations on the same error**.
- Cap fan-out at 5.
- If a contract turns out to be wrong mid-flight, message the in-flight owner **immediately** (`SendMessage`) so its tests assert the corrected behavior. Never silently patch it at integration time.

## 5. Verify — twice

The one who writes is not the one who grades.

1. **Re-run every worker's acceptance commands yourself.** Not the worker's transcript — the actual command. Label results _independently verified_.
2. **Spawn `verifier`** on the integrated diff, with the plan as input. Spawn `security-reviewer` too if the diff touches auth, payments, guest data, tenant scoping, or a vendor adapter.
3. Run `pnpm verify` on the integrated tree. It must be green on a clean checkout and mirror CI.

## 6. Integrate + document

Orchestrator-owned, never delegated:

- Merge worktrees, resolve conflicts, run `pnpm verify` again.
- Update `docs/backlog/TODO.MD` status, `docs/feature-matrix.md` rows, `CLAUDE.md` Current state — **in the same commit** as the code.
- Append any bite (>30-min debug, red-team finding, surprise) to `docs/lessons-learned.md`.
- Mark the plan file `status: done`.
- Write the handoff (see the `handoff` skill).

## Report to Felix

State per stream: what landed, the evidence, and what did **not** land and why. Distinguish _independently verified_ from _agent-reported_. An honest partial beats a clean-looking summary with a hidden gap.
