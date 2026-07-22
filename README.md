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
| **Executive Brief** | `/` | The primary workspace: **Today's Priorities**, **Focus Today** (highest-value commitments), **Waiting For Me**, Green/Yellow/Red health, **Emerging Risks**, **Momentum**, position metrics, deliverables, officer updates, and the latest activity. |
| **Organization** | `/organization` | Your officers: objectives, active/completed/overdue **commitments**, workload, average confidence, and a delivery score from observable data — plus charter, work, and blockers. |
| **Commitments** | `/commitments` | Owned promises to deliver outcomes, with success criteria and a full lifecycle (Draft → Committed → In progress → Blocked ⇄ → Completed → **Verified** by you). |
| **Work** | `/work` | Execution detail: assignments grouped by status, with **deliverable review** (Approve / Request revision / Reject). |
| **Decisions** | `/decisions` | The decision workflow: a prioritized queue with executive summary, risks, owner, and due date — resolve it, then track it through **execution to verification**. |
| **Knowledge** | `/knowledge` | The filterable organization timeline today; becomes the Organizational Mind in future milestones. |
| **Executive Assistant** | `/ea` | A workspace: conversation with Vera plus live Pending Decisions and Active Commitments, and sample Recommendations/Research/Drafts panels. |

**Delegate from anywhere** — the sidebar (and mobile header) button opens a
dialog: choose officer → define outcome → success criteria → due date → a
commitment is created without leaving the page.

Old routes (`/officers`, `/activity`) permanently redirect to their new homes.

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
- [0004 — Engineering model vs. Organizational Twin ontology](docs/adr/0004-canonical-model-boundary.md)
- [0005 — Commitment engine & decision workflow](docs/adr/0005-commitment-engine.md)

Full documentation and the implementation log live in [`docs/`](docs/README.md).

## Deploying to Netlify

The app deploys on Netlify via `@netlify/plugin-nextjs` (configured in
`netlify.toml`).

1. Connect the GitHub repo in Netlify (New site → Import from Git).
2. Build command `npm run build` and the Next.js plugin are picked up from
   `netlify.toml`; no environment variables are required for the MVP.
3. Deploy. Every push to `main` ships automatically.

**Persistence on serverless:** the MVP stores state in a JSON file. Netlify (like
any serverless host) has a read-only deployed filesystem, so the repository
automatically falls back to the OS temp dir (`/tmp`). This makes the app run, but
persistence is **ephemeral** — each function instance has its own copy and it
resets when the instance recycles, so decisions/reviews may not survive across
requests. That is fine for a demo or executive review; for durable multi-user
state, implement a real database behind `ConsoleRepository` (see ADR 0002).
Override the location anywhere with the `FOUNDER_CONSOLE_DATA_DIR` env var.

## Connecting real agents later

Implement the relevant interface in `src/lib/console/integrations/providers.ts`
and register it in `mock-adapters.ts`:

- Replace `DeterministicEaProvider` with a model-backed `ConversationProvider`.
- Provide an `AgentProvider` to dispatch assignments to real Claude Code / Codex
  / Pi sessions and report status.
- Swap `LocalJsonRepository` for a database adapter behind `ConsoleRepository`.

No domain logic or UI changes are required.
