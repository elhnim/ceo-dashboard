# Milestone 2 — Executive Coordination Engine

_Executive summary · 22 July 2026_

## Executive Summary

**Objective.** Evolve Founder Console from an executive dashboard into an
executive operating system: the single place where the Product Director makes
decisions, delegates work, tracks commitments, understands organizational
health, and coordinates execution.

**Business value.** Accountability becomes a first-class concept. Every
delegation produces a commitment with an owner, success criteria, and a due
date; every delivery loops back for the Director's verification; every
decision is tracked from approval through execution to a verified outcome.
The Director coordinates the organization without leaving Founder Console —
and without any AI in this milestone.

**Major deliverables.** Commitment engine (full lifecycle, pages, creation
modal) · Decision workflow (stages, risks, owners, due dates, linked
commitments) · Officer management (objectives, commitments, workload, average
confidence, delivery score) · Executive Brief 2.0 (Focus Today, Waiting For
Me, Green/Yellow/Red health, Emerging Risks, Momentum) · global Delegation ·
filterable Organization Timeline · expanded Executive Workspace · lightweight
operational metrics · full documentation.

**Architecture impact.** One new domain entity (Commitment) with whitelisted
lifecycle transitions; decision workflow fields with a load-time migration for
older data files; ~10 new pure domain functions; 6 new API routes; no new
dependencies; repository/service/adapter patterns unchanged. Risk: the JSON
store remains the persistence layer — durable multi-user state is still the
top M3 item.

**Executive workflow.** The morning starts and ends on one screen: ranked
priorities, the commitments worth attention, everything waiting for the
Director, deterministic risk signals, and momentum since the last brief.
Delegation happens from anywhere in two clicks; verification closes the loop.

**Technical debt.** JSON persistence (ephemeral on serverless) · no CI ·
sample content in three EA panels (labelled) · WorkAssignment/Commitment
overlap to be reconciled when real agents execute work.

**Recommendation: Ready for Executive Review.** All ten deliverables are
implemented and verified (76 tests, clean build/lint, end-to-end runtime smoke
of delegation → lifecycle → verification). Not "Ready for Production" because
persistence is intentionally still local/ephemeral and there is no
authentication — both deferred by design to Milestone 3.

## Before vs after

| | Milestone 1.1 | Milestone 2 |
| --- | --- | --- |
| Accountability | Assignments with statuses | Commitments: owned promises with success criteria, confidence, verification |
| Decisions | Resolve (approve/reject/…) | Full workflow: draft → needs review → ready → approved → executed → verified |
| Delegation | Assign work from officer pages | Delegate from anywhere; commitment created without page switching |
| Officer pages | Charter + work | + objectives, commitments (active/completed/overdue), workload, average confidence, delivery score |
| Brief | Today's Priorities + position | + Focus Today, Waiting For Me, Green/Yellow/Red health, Emerging Risks, Momentum |
| Activity | Simple feed | Filterable organization timeline (commitments, decisions, reviews, work, governance) |
| EA workspace | 4 panels | 5 panels (+ live Active Commitments) |

## Architecture

- **Domain changes** — `Commitment` entity + `CommitmentNote`;
  `CommitmentStatus`/`ConfidenceLevel`/`DecisionStage` enums with whitelisted
  transition maps; decision workflow fields (`executiveSummary`, `risks`,
  `decisionOwnerId`, `dueDate`, `linkedCommitmentIds`, `stage`); five new
  activity event types; pure logic for overdue/workload/confidence/delivery
  score/focus/waiting/risks/momentum/health signal. Commitments carry the
  optional M1.1 `meta` field (unused, by design).
- **Repository changes** — none to the port. A load-time `migrateState` fills
  post-M1.1 fields in older data files (idempotent, non-destructive).
- **Service changes** — expanded `Overview` (focus/waiting/risks/momentum/
  health/commitment metrics), expanded `OfficerDetail` (commitments, workload,
  confidence, delivery score), new commitment CRUD/status/notes, decision
  stage advancement, officer options for delegation.
- **API changes** — new: `GET/POST /api/commitments`,
  `POST /api/commitments/[id]/status`, `POST /api/commitments/[id]/notes`,
  `POST /api/decisions/[id]/stage`, `GET /api/organization/officers`.
  Existing routes unchanged.
- **Persistence** — same local JSON adapter; seed now includes 9 commitments
  covering every lifecycle status (including one overdue) and workflow fields
  on all 8 decisions.

## Testing

**76 tests passing** (53 prior + 23 new): commitment creation and owner
invariant, every legal/illegal lifecycle transition, blocking semantics,
notes, workload, average confidence, delivery score (on-time and late),
focus/waiting/risks/momentum, health signal, decision stage advancement and
approval coupling, and pre-M2 data-file migration. Clean typecheck, lint, and
production build. Runtime smoke test: all 9 routes 200, delegation via API
creates a commitment, full lifecycle to verified, illegal transition rejected
(400), decision approve → executed, Brief 2.0 sections render.

## Known limitations

- Persistence is local/ephemeral on serverless (unchanged; top M3 item).
- No authentication (unchanged, deferred by design).
- EA Recommendations/Research/Drafts panels remain labelled samples.
- Delivery score needs concluded commitments before it shows (by design — no
  fabricated numbers).
- WorkAssignments and Commitments coexist; consolidation deferred until real
  agents execute work.

## Outstanding decisions

Persistence backend · authentication approach · first live `AgentProvider` ·
whether WorkAssignments fold into Commitments in M3 · the six in-app decisions
awaiting the Director.

## Milestone 3 recommendations

1. Durable database behind `ConsoleRepository` (removes the biggest risk).
2. First live `AgentProvider` — one officer executes a commitment end to end.
3. Real EA reasoning into the workspace panels (recommendations, drafts).
4. Authentication for the Director; CI with preview deploys.
5. Notifications when decisions or verifications start waiting.
