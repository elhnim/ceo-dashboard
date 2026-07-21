# Founder Console

Founder Console is the first working application of a future platform for
intelligent organizations. It lets one Product Director supervise a small team
of persistent AI officers — review deliverables, resolve decisions, answer
questions, and understand progress — from web and mobile, with the lowest
possible cognitive load.

This is an MVP. It deliberately does **not** implement autonomous orchestration,
voice, model routing, graph databases, GitHub/deployment automation, multi-
tenancy, billing, or the full Organizational Twin/Mind. Those have typed
placeholders (see the integration providers) but no implementation.

## Run it

```bash
npm install
npm run dev
# open http://localhost:3000/console
```

- Founder Console is **not** gated by Microsoft SSO (auth is a future
  capability); the rest of the CEO Dashboard still is.
- State persists to `.data/founder-console.json` (git-ignored), seeded on first
  load. Delete that file to reset to the founding seed.

```bash
npm test        # domain, validation, workflow, EA, and seed-integrity tests
npm run lint    # eslint
npm run build   # production build
```

## What you can do

| Screen | Route | Purpose |
| --- | --- | --- |
| **Home** | `/console` | The executive morning brief: health, summary metrics, decisions needing you, deliverables ready for review, officer activity, and work to continue. |
| **Decisions** | `/console/decisions` | Prioritized decision queue. Approve / Reject / Modify / Discuss / Delegate / Defer, with a recorded rationale. |
| **Officers** | `/console/officers` | The officer directory and per-officer detail (charter, mission, authority, boundaries, current work, deliverables, blockers, activity). Includes **Assign work**. |
| **Work** | `/console/work` | Assignments grouped by status, with per-assignment detail and **deliverable review** (Approve / Request revision / Reject). |
| **Activity** | `/console/activity` | The organization-wide chronological event feed. |
| **EA** | `/console/ea` | A chat with the Executive Assistant. Deterministic for the MVP; swappable for a real model via `ConversationProvider`. |

## Architecture

Modular boundaries, domain logic decoupled from every vendor:

```
src/types/console/               Domain entity types
src/lib/console/
  domain/     enums · validation · logic (pure reads) · transitions (pure writes)
  persistence/ repository port · local JSON adapter · founding seed
  integrations/ provider interfaces · mock adapters
  ea/          deterministic Executive Assistant (ConversationProvider)
  services/    application service (the only thing routes/pages call)
  format.ts    UI formatting helpers
src/app/console/                 Pages, layout, loading/error/not-found
src/app/api/console/             Route handlers (decisions, deliverables, work, ea, brief)
src/components/console/          Presentational + client-action components
tests/console/                   Node --test suite
docs/console/adr/                Architecture decision records
```

Key principles:

- **Roles are separate from the people filling them** (Person ↔ Role via
  OfficerAssignment).
- **The UI never touches the repository**; it goes through the service, which
  wraps pure transitions in serialized repository transactions.
- **No vendor coupling** — Claude/OpenAI/Supabase/GitHub/etc. are reachable only
  by implementing a provider interface.

See the ADRs for the reasoning:

- [0001 — Stack & architecture](adr/0001-stack-and-architecture.md)
- [0002 — Persistence & integration boundaries](adr/0002-persistence-and-integrations.md)
- [0003 — Testing approach](adr/0003-testing.md)

## Connecting real agents later

Implement the relevant interface in `src/lib/console/integrations/providers.ts`
and register it in `mock-adapters.ts`:

- Replace `DeterministicEaProvider` with a model-backed `ConversationProvider`.
- Provide an `AgentProvider` to dispatch assignments to real Claude Code / Codex
  / Pi sessions and report status.
- Swap `LocalJsonRepository` for a database adapter behind `ConsoleRepository`.

No domain logic or UI changes are required.
