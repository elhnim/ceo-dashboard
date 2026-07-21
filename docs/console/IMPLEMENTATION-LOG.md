# Founder Console — implementation log

Concise record of what was built and the decisions taken along the way.

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
   and changing status, the EA conversation, and brief generation. `/console`
   and `/api/console` exempted from the SSO middleware.
4. **App shell + Home.** Responsive console chrome (desktop sidebar + mobile
   bottom nav), calm design over the existing monochrome tokens, loading/error/
   not-found states, and the executive Home/morning-brief screen.
5. **Feature screens.** Decisions queue with the six resolution actions;
   officer directory + detail with "Assign work"; work board + assignment detail
   with deliverable review; activity timeline; EA chat.
6. **Tests, docs, verification.** 44 tests via `node --test` (zero deps, custom
   `@/` resolution hook); three ADRs; README + this log; full typecheck, lint,
   and production build.

### Decisions

- Built **additively** under `/console`; the existing CEO Dashboard is
  untouched.
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
