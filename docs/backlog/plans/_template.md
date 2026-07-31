---
id: wpN-slug
title: <one line>
status: draft # draft | approved | in_progress | blocked | done
phase: <0-6>
owner: <orchestrator / Felix>
created: YYYY-MM-DD
updated: YYYY-MM-DD
depends_on: [] # plan ids or decision rows in TODO.MD
---

# <Title>

## Goal

One paragraph. What is true after this lands that isn't true now.

## Why now

What it unblocks. If it doesn't drive stay #2 or unblock something that does, say why it's still worth doing.

## Pinned contracts

> Fixed before any agent is spawned. Workers build against these, not against each other's code.
> A contract change mid-flight is messaged to the in-flight owner immediately — never patched silently at integration.

- **Schema / migration:** …
- **Function signatures:** …
- **API shapes:** … (envelope `{ data, meta, pagination? }`; errors `{ error: { code, message, details? } }`)
- **Env vars:** … (declared in `packages/config/src/env.ts`, audited by `pnpm check-env`)

## Streams

| ID  | Goal | Owns (exclusive write) | Reads only | Depends on |
| --- | ---- | ---------------------- | ---------- | ---------- |
| A   |      |                        |            | —          |
| B   |      |                        |            | —          |

**Ownership rule:** no path appears in two `Owns` cells. Shared artifacts have exactly one owner; everyone else treats them as read-only.

## Acceptance evidence

| Stream | Command / probe        | What proves it |
| ------ | ---------------------- | -------------- |
| A      | `pnpm --filter … test` | …              |

Claims are not evidence. Every row is re-run by the orchestrator, not taken from a worker transcript.

## Out of scope

Explicit list. "Not now" beats a stub.

## Human-owned

Anything only Felix can do (accounts, billing, DNS, legal, vendor contracts, spend approval).

## Close-out checklist

- [ ] `pnpm verify` green on the integrated tree
- [ ] `verifier` pass on the diff (+ `security-reviewer` if auth / payments / guest data / tenancy / vendor)
- [ ] `docs/backlog/TODO.MD` status updated in the same commit
- [ ] `docs/feature-matrix.md` rows updated in the same commit
- [ ] `CLAUDE.md` Current state reconciled
- [ ] Lessons appended to `docs/lessons-learned.md` (or explicitly none)
- [ ] ADR written for anything a future maintainer would question
- [ ] Handoff written + indexed
- [ ] `status: done` set above
