# ADR 0005 — Commitment engine & decision workflow

- Status: Accepted
- Date: 2026-07-22 (Milestone 2)

## Context

Milestone 2 turns Founder Console from an executive briefing surface into an
executive coordination engine. Two things were missing:

1. A first-class object for **accountability**. WorkAssignments describe
   execution detail; nothing modelled the executive-level promise — "this
   officer will deliver this outcome by this date."
2. A **workflow** for decisions. Decisions previously had only a resolution
   status (waiting → approved/rejected/…); there was no way to track an
   approved decision through execution to a verified outcome.

## Decision

### Commitment as a first-class domain object

A `Commitment` is a promise by an officer to deliver an outcome — not a task.
It carries outcome, success criteria, a confidence level, a due date, an owner
(**always required** — enforced in validation and transitions), dependencies,
linked decisions, and notes. Lifecycle:

```
Draft → Committed → In progress → (Blocked ⇄) → Completed → Verified
```

- Transitions are whitelisted in `COMMITMENT_TRANSITIONS`; anything else is a
  `ValidationError`. Blocking requires a reason. `Verified` is terminal.
- `Completed` means the officer says it's delivered; **`Verified` means the
  Director confirmed the outcome** — the two-step close is the accountability
  loop.
- Due dates mean "by the end of that day" (`endOfDueDay`), for both overdue
  detection and the delivery score.

### Decision workflow stage, orthogonal to resolution

Decisions gain a `stage` (`draft → needs-review → ready → approved → executed
→ verified`) alongside the existing `status` (how the Director resolved it).
Approving/modifying a decision advances the stage to `approved` automatically;
`executed` and `verified` are advanced explicitly. Negative resolutions
(reject/defer/delegate) leave the stage untouched — the lifecycle has no
failure branch by design, and `status` carries that information.

Decisions also gain `executiveSummary`, `risks`, `decisionOwnerId`, `dueDate`,
and `linkedCommitmentIds`.

### Observable metrics only

- **Delivery score** = share of concluded commitments delivered on or before
  their due date (no due date counts as on time). Null until an officer has
  concluded at least one commitment — no fabricated scores.
- **Average confidence** = mean of stated confidence on active commitments
  (high 3 / medium 2 / low 1), reported as a level.
- **Workload** = open commitments + active assignments. `OVERLOAD_THRESHOLD`
  (5) drives the overloaded-officer risk signal.

No AI scoring anywhere.

### Backward compatibility via load-time migration

`migrateState` runs on every repository load: it fills `commitments: []` and
derives the new decision fields for pre-M2 data files (legacy approved
decisions land at stage `approved`, everything else at `ready`). Idempotent;
no data is discarded. Commitments support the optional `meta`
(KnowledgeMetadata) field from ADR 0004's companion work — still unused by
design.

## Consequences

- The Director can delegate, track, and verify outcomes without leaving the
  app; accountability is a domain concept, not a UI convention.
- WorkAssignments remain for execution detail; a future milestone may fold
  them into commitments once real agents execute work.
- The linear decision lifecycle means rejected decisions simply retain their
  resolution status at their last stage — acceptable, documented here.
