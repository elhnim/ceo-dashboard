# Founder Console — implementation log

Concise record of what was built and the decisions taken along the way.

## 2026-07-21 — Milestone 1.1: Executive Office revisions

A refinement pass from Executive Office review; no redesign, no scope
expansion. All existing architecture retained.

1. **Executive Brief.** Home renamed; a dominant **Today's Priorities** section
   now leads the screen — the 3–5 items worth the Director's next 30 minutes,
   ranked by urgency and impact via a new pure domain function
   (`todaysPriorities` in `domain/logic.ts`, 9 new tests). Each priority
   carries title, why it matters, estimated time, a deterministic confidence
   level, and a recommended action. Below it: brief highlights/risks, position
   metrics, deliverables, officer updates, work in motion.
2. **Navigation.** New order: Executive Brief · Organization · Work ·
   Decisions · Knowledge · Executive Assistant. `/officers` →
   `/organization`, `/activity` → `/knowledge` (permanent redirects keep old
   links working). Knowledge hosts the organizational record and states it
   will become the Organizational Mind in future milestones.
3. **EA workspace.** The EA page is now a workspace: conversation plus panels
   for Recommendations (sample), Research (sample), Drafts (sample), and
   Pending Decisions (live from state).
4. **Canonical model boundary.** ADR 0004 records that the engineering model
   is not the Organizational Twin ontology; the types header points to it.
5. **Knowledge metadata.** All nine major entities gained an optional
   `meta?: KnowledgeMetadata` field (provenance, confidence, evidence,
   relatedEntities, history). Nothing reads or writes it — preparation only.
6. **Copy & polish.** Dashboard/monitoring language replaced with
   direct/decide/execute language; loading skeleton matches the new Brief;
   mobile nav uses short labels.

## 2026-07-21 — MVP build

1. **Foundation.** Domain types (`src/types/console`), `as const` enums with
   labels/ranks, field + referential-integrity validation, and pure derivation
   logic (metrics, health, queues, officer summaries, brief generation).
2. **Persistence + integrations.** `ConsoleRepository` port with a serialized
   local JSON adapter; the founding seed (5 officers, 10 assignments across all
   8 statuses, 5 deliverables, 8 decisions across all types, 14 activity events,
   a baseline brief, and the 11 strategic decisions recorded as constitutional
   activity). Provider interfaces for all seven future seams, with mock adapters
   only. Deterministic Executive Assistant implementing `ConversationProvider`.
3. **Services + API.** Pure state transitions wrapped by an application service;
   route handlers for resolving decisions, reviewing deliverables, creating work
   and changing status, the EA conversation, and brief generation.
4. **App shell + Home.** Responsive console chrome (desktop sidebar + mobile
   bottom nav), calm design over the existing monochrome tokens, loading/error/
   not-found states, and the executive Home/morning-brief screen.
5. **Feature screens.** Decisions queue with the six resolution actions;
   officer directory + detail with "Assign work"; work board + assignment detail
   with deliverable review; activity timeline; EA chat.
6. **Tests, docs, verification.** 44 tests via `node --test` (zero deps, custom
   `@/` resolution hook); three ADRs; README + this log; full typecheck, lint,
   and production build.

## 2026-07-21 — New project: full takeover at `/`

The Product Director confirmed this is a new project and the pre-existing CEO
Dashboard code should be ignored/removed. Actions:

- Moved every Founder Console route from `/console/*` to the root (`/`,
  `/decisions`, `/officers`, `/work`, `/activity`, `/ea`) and the API from
  `/api/console/*` to `/api/*`.
- Deleted the old CEO Dashboard pages, components, services, hooks, types,
  Supabase/NextAuth/Microsoft Graph libraries, auth middleware, Netlify
  functions, and migration scripts.
- Removed the now-unused dependencies (Supabase, NextAuth, Azure/Microsoft
  Graph, caldav, dnd-kit, next-pwa, `@anthropic-ai/sdk`, `@netlify/functions`).
- Rewrote the root layout to mount the console shell directly (no auth), and
  updated README/CLAUDE.md/ADRs to describe the standalone project.

### Decisions

- Founder Console is the whole app at `/`; the old product was removed.
- Founder Console is **unauthenticated** for the MVP (single user, auth is a
  future capability).
- Persistence is a **local JSON file** behind a repository port — runnable with
  no credentials, swappable for a real database later.
- Enums modelled as `as const` (not TS `enum`) for type-stripping safety.

### Known limitations (intentional)

- No real agent orchestration; `AgentProvider` is `null`.
- JSON persistence is single-process/local only (see ADR 0002).
- UI is covered indirectly through the tested domain layer; no browser-level UI
  test harness yet.
