---
name: handoff
description: Write the end-of-session continuity note in docs/handoff/ and update its index. Use at the end of any session that did non-trivial work.
---

# Write a session handoff

Cross-session memory you control, instead of relying on auto-summary. The next agent reads the newest handoff _first_ and should not have to re-derive project state from the tree.

## When

End of any session with non-trivial work: code shipped, a decision made, a doc restructured, a red-team pass triaged. Skip for pure Q&A sessions.

## How

Create `docs/handoff/YYYY-MM-DD-slug.md`:

```markdown
# YYYY-MM-DD — <slug in words>

## State

<Two lines max. What phase, what's deployed, what's blocked. Then link to
`../backlog/TODO.MD` Status Overview — don't restate it.>

## What happened

<What changed and **why**. The diff shows the what; you supply the why.
Name the files. Note what you deliberately left untouched and the reason.>

## Next move

<The single most useful thing for the next session to pick up, and where it's
tracked. If nothing is open, say so explicitly.>

## Suggested skills

<Which skills the next session will likely need, or "none used this session".>
```

Then add one line to the top of the Index in `docs/handoff/README.md`:

```markdown
- [YYYY-MM-DD — <title>](YYYY-MM-DD-slug.md)
```

## Rules

- **Reference, don't duplicate.** Link to `TODO.MD`, `feature-matrix.md`, ADRs, plan files. A handoff that restates the tracker goes stale the moment the tracker moves.
- **Keep it under ~40 lines.** It is a pointer, not a report.
- **Record the _why_ of decisions**, especially reversals and things you chose not to do — that is the part no other artifact captures.
- **Never put history in `CLAUDE.md`.** Shipped-feature narrative belongs here; `CLAUDE.md` carries only live state and rules.
- The handoff lands in the **same commit** as the work it describes.
