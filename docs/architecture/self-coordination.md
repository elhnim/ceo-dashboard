# How Founder Console coordinates its own development

_Executive Office v0.1 · EO-005 · 22 July 2026_

Executive Order EO-005 made Founder Console the first organization it manages.
This document explains the machinery.

## The Project State Engine

`src/lib/console/project/` is the **single source of truth** for Founder
Console's own development program. It follows the same architecture as the
organization console: typed state → seed → pure derivations → repository →
service. No Executive Office panel hardcodes a milestone, backlog, progress
figure, or recommendation — every panel consumes the derived briefing.

**Stored facts** (`seed.ts`, versioned in git):
layers · milestones with items · sprints with session topics · executive
approvals · research briefs · architecture and engineering backlogs · the
executive log · curated engineering facts (branch, build, tests, latest ADR).

**Runtime mutations** (persisted to `.data/founder-console-project.json`):
approvals resolved, sessions begun. On load the engine merges runtime
mutations over the current seed, so each engineering cycle's curation commit
updates every panel without manual resets.

**Derivations** (`logic.ts`, pure):
current layer/milestone/sprint · milestone progress · overall status ·
project health (green/yellow/red with a reason) · the waiting-for-me list ·
**exactly one recommended next action**, ranked: open approval → session-ready
architecture topic → open milestone item → top of the product backlog · the
Begin Session agenda.

## The operating loop

1. **The Director opens Founder Console.** The Executive Office states the
   current layer, milestone, sprint, health, and one recommended action with
   why / time / outcome / impact.
2. **Waiting for me** lists executive approvals only (architecture, merge,
   roadmap, research). Approve/defer is recorded by the engine and appended
   to the executive log.
3. **Begin Session** opens the highest-priority prepared agenda — questions,
   supporting research, expected deliverables, and a decision framed per the
   Executive Decision Protocol (background · options · trade-offs ·
   recommendation · risks). No manual prompt is required.
4. **The Executive Office (the engineering counterpart) executes** the
   resulting work, then updates the seed facts in the same pull request:
   milestone items ticked, approvals added for the next review, the log
   extended, engineering facts refreshed.
5. The merge lands, the engine re-derives everything, and the loop repeats.

## Division of responsibility

- **Product Director:** direction, judgment, approval. Reads one screen,
  makes the decisions it surfaces.
- **Founder Console:** remembers project state, tracks the roadmap and
  backlogs, prepares research and agendas, recommends the next action,
  records every decision.
- **External advisors (ChatGPT et al.):** consulted for perspective; no
  longer the project's memory or its operating system.

## Honest limitations (v0.1)

- Seed facts are curated by the Executive Office per engineering cycle —
  the engine derives the briefing from facts, it does not yet observe git/CI
  directly. Live observation is a Layer 3 candidate once CI exists.
- Session outcomes are recorded as approvals/log entries, not free-form
  minutes; richer capture arrives with real EA reasoning.
- One program, one director — multi-program support is out of scope until the
  Twin lands.
