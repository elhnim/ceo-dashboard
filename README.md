# Founder Console

Founder Console is the first working application of a future platform for
intelligent organizations. It lets one Product Director supervise a small team
of persistent AI officers — review deliverables, resolve decisions, answer
questions, approve decisions, and understand organizational progress — from web
and mobile, with the lowest possible cognitive load.

This is an MVP. It deliberately does **not** implement autonomous orchestration,
voice, model routing, graph databases, GitHub/deployment automation, multi-
tenancy, billing, or the full Organizational Twin/Mind. Those seams have typed
placeholders (see the integration providers) but no implementation.

## Getting started

```bash
npm install
npm run dev
# open http://localhost:3000
```

The app runs with **no external services or credentials**. State persists to
`.data/founder-console.json` (git-ignored), seeded with the founding
organization on first load. Delete that file to reset.

```bash
npm test        # domain, validation, workflow, EA, and seed-integrity tests
npm run lint    # eslint
npm run build   # production build
```

## The screens

| Screen | Route | Purpose |
| --- | --- | --- |
| **Home** | `/` | The executive morning brief: org health, summary metrics, decisions needing you, deliverables ready for review, officer activity, and work to continue. |
| **Decisions** | `/decisions` | Prioritized decision queue. Approve / Reject / Modify / Discuss / Delegate / Defer, with a recorded rationale. |
| **Officers** | `/officers` | The officer directory and per-officer detail (charter, mission, authority, boundaries, current work, deliverables, blockers, activity). Includes **Assign work**. |
| **Work** | `/work` | Assignments grouped by status, with per-assignment detail and **deliverable review** (Approve / Request revision / Reject). |
| **Activity** | `/activity` | The organization-wide chronological event feed. |
| **EA** | `/ea` | A chat with the Executive Assistant. Deterministic for the MVP; swappable for a real model via `ConversationProvider`. |

## Architecture

Modular boundaries, domain logic decoupled from every vendor:

```
src/types/console/            Domain entity types
src/lib/console/
  domain/     enums · validation · logic (pure reads) · transitions (pure writes)
  persistence/ repository port · local JSON adapter · founding seed
  integrations/ provider interfaces · mock adapters
  ea/          deterministic Executive Assistant (ConversationProvider)
  services/    application service (the only thing routes/pages call)
  format.ts    UI formatting helpers
src/app/                      Pages, layout, loading/error/not-found, API routes
src/components/console/       Presentational + client-action components
tests/console/                node --test suite
docs/adr/                     Architecture decision records
```

Key principles:

- **Roles are separate from the people filling them** (Person ↔ Role via
  OfficerAssignment).
- **The UI never touches the repository** — it goes through the service, which
  wraps pure transitions in serialized repository transactions.
- **No vendor coupling** — Claude/OpenAI/GitHub/etc. are reachable only by
  implementing a provider interface.

See the ADRs for the reasoning:

- [0001 — Stack & architecture](docs/adr/0001-stack-and-architecture.md)
- [0002 — Persistence & integration boundaries](docs/adr/0002-persistence-and-integrations.md)
- [0003 — Testing approach](docs/adr/0003-testing.md)

Full documentation and the implementation log live in [`docs/`](docs/README.md).

## Connecting real agents later

Implement the relevant interface in `src/lib/console/integrations/providers.ts`
and register it in `mock-adapters.ts`:

- Replace `DeterministicEaProvider` with a model-backed `ConversationProvider`.
- Provide an `AgentProvider` to dispatch assignments to real Claude Code / Codex
  / Pi sessions and report status.
- Swap `LocalJsonRepository` for a database adapter behind `ConsoleRepository`.

No domain logic or UI changes are required.
