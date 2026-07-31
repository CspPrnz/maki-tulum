---
name: grill
description: Interview Felix before building a non-trivial feature — surface edge cases, tradeoffs and hidden decisions before any code is written. Use at the start of a new feature, phase, or work package.
---

# Grill before you build

Before writing anything non-trivial, **interview Felix**. This is the cheapest place in the whole pipeline to catch the expensive mistake. Never skip it silently; skip only when he explicitly says so, or when the diff fits in one sentence.

## Run it

Ask in **small batches (2–4 questions)**, not a wall of thirty. Use `AskUserQuestion` with concrete options where the choice is enumerable — a decision with options is easier to answer than an open prompt. Follow up on vague answers before moving on.

Cover, in this order:

1. **Outcome.** What does the guest/owner actually get? How do we know it worked — which metric moves?
2. **The thesis test.** Does this drive **stay #2**? If Felix can't say yes, the honest recommendation is to defer it. (`CLAUDE.md` § When in doubt.)
3. **Buy vs. build.** Is there a vendor? If yes, it goes behind an adapter with a fake. Does it cost money — has Felix approved the spend?
4. **Edge cases.** Empty state, first run, concurrent actors, partial failure, retries, what happens on the OTA side, what happens mid-payment.
5. **Money + legal, if touched.** Which entity is merchant of record? What's itemized in the quote? Which obligation is triggered? These are _decisions_, not implementation details — see the blocking-decision tables in `docs/backlog/TODO.MD`.
6. **i18n + a11y.** Every user-facing string in EN/ES/DE in the same commit. Any new input ≥16px, any target ≥44px.
7. **Out of scope.** Force an explicit list. "Not now" beats a stub.
8. **Verification.** What command or probe proves this works end to end? If nothing can, restructure until something can.

## Land it

Write the answers into a plan file at `docs/backlog/plans/<slug>.md` (from `_template.md`) — pinned contracts, scope, out-of-scope, acceptance evidence. That file, not the conversation, is what workers build against.

Anything Felix defers becomes a dated row in the blocking-decisions table in `docs/backlog/TODO.MD` with an owner and a due phase. A deferred decision that already constrains the schema is **not** non-blocking — that was red-team finding MRT-15-P0-02, and it is the failure mode this step exists to prevent.
