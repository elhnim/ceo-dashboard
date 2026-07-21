# Milestone 1 — Founder Console MVP

_Executive summary · 21 July 2026_

A visual version of this pack (with screenshots) was delivered as an artifact to
the Product Director.

## Summary

- **What was built** — Six screens (Home/morning brief, Decisions, Officers,
  Work, Activity, Executive Assistant) over a strongly-typed domain, local
  persistence, a deterministic EA, and mock adapters for every future
  integration. Runs locally with no external services or credentials.
- **Why** — The first working application of the platform for intelligent
  organizations, and a usable tool to manage the platform's own development.
  The design goal throughout is to reduce executive cognitive load.
- **Scope** — All twelve MVP capabilities were built. Out of scope by design
  (typed placeholders only): autonomous orchestration, voice, model routing,
  graph databases, GitHub/deployment automation, multi-tenancy, billing, and the
  full Organizational Twin/Mind.

## Architecture

- **New modules** — `domain`, `persistence`, `integrations`, `ea`, `services`,
  and the app shell + UI.
- **New entities** — Organization, Person, Role, OfficerAssignment,
  WorkAssignment, Deliverable, Decision, ActivityEvent, ExecutiveBrief
  (+ ConversationTurn). Roles are modelled separately from the people filling
  them.
- **Database changes** — None. State persists via a `ConsoleRepository` port
  (local JSON adapter), swappable for Postgres/Supabase/SQLite. Serverless falls
  back to a writable temp dir.
- **APIs** — `/api/decisions/[id]` (GET, POST resolve), `/api/deliverables/[id]/review`
  (POST), `/api/work` (GET, POST), `/api/work/[id]/status` (POST), `/api/ea`
  (GET, POST), `/api/brief` (POST).
- **UI** — Six routes plus a responsive shell (desktop sidebar + mobile bottom
  nav). Calm, monochrome design with semantic status colors and progressive
  disclosure.

## Known limitations

- Persistence is ephemeral on serverless (Vercel `/tmp`, resets per instance).
- No real agent backend (`AgentProvider` defined but unwired).
- The EA is deterministic, not a live model.
- No authentication (single-user MVP).
- UI is tested indirectly; no browser-level E2E suite yet.
- Performance signals are placeholders.

## Technical debt

- JSON file store is single-process and not production-grade (replace behind the
  repository port).
- Custom zero-dependency `@/` resolver for the Node test runner.
- Internal `console` namespace retained as a module boundary (could flatten).
- No CI pipeline yet.

## Open decisions

- Persistence backend for durable/multi-user state.
- Authentication approach.
- First real `AgentProvider` (Claude Code / Codex / Pi).
- The six in-app decisions still waiting for the Director (approve Twin Spec
  v0.1, knowledge-promotion permission, adopt the 10-Year Rule, sequencing, lock
  the first domain, blocker risk).

## Changed files

244 files changed (+6,188 / −21,384): **55 added** (Founder Console + docs),
**181 removed** (the previous CEO Dashboard and its Supabase/NextAuth/Microsoft
Graph/PWA/Netlify stack), **8 modified**. 34 new Founder Console source/test files.

## Tests

44 tests on Node's built-in runner (zero added dependencies): `enums`,
`validation`, `logic`, `transitions`, `ea`, `seed`. Plus a clean typecheck,
lint, production build, and a runtime smoke test of every route and mutation.

## Next milestone — M2: First live officer & durable state

- Swap the JSON store for a real database behind `ConsoleRepository`.
- Wire one real `AgentProvider` so an officer executes an assignment and submits
  a deliverable end to end.
- Add authentication for the Director.
- Stand up CI (lint · test · build) and preview deploys.
- Deliverable versioning/diff view and new-decision notifications.
