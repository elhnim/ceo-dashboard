# ADR 0003 — Testing approach

- Status: Accepted
- Date: 2026-07-21

## Context

The brief requires domain unit tests, validation tests, key workflow tests, and
seed-data integrity tests, while keeping the application dependency-light and
runnable after every change.

## Decision

**Use Node's built-in test runner (`node --test`) with native TypeScript
type-stripping — zero new dependencies.**

- Node 22.22 is present and runs `.ts` tests directly.
- The domain layer is designed for this: pure functions in `domain/logic.ts`
  and `domain/transitions.ts` take state and return results, so workflows are
  tested without a database, server, or React.
- Because the source uses the `@/*` path alias and extensionless imports, a
  tiny zero-dependency resolution hook (`tests/console/loader.mjs`, registered
  via `tests/console/register.mjs`) maps `@/` to `src/` and resolves `.ts`
  files. Type-only imports are stripped before resolution, so they never reach
  the hook.

Run with `npm test`.

## Coverage

- `enums.test.ts` — enum/label/rank integrity and action→status mapping.
- `validation.test.ts` — field validators (work, decision, deliverable).
- `logic.test.ts` — metrics, health derivation, queues, officer summaries,
  brief generation.
- `transitions.test.ts` — decision resolution, deliverable review, assignment
  creation, block/unblock — including activity-event side effects and error
  paths.
- `ea.test.ts` — Executive Assistant intent matching and replies for every
  required command.
- `seed.test.ts` — full referential integrity plus content minimums (5
  officers, ≥8 assignments, ≥4 deliverables, ≥5 decisions, all statuses and
  decision types represented).

## Consequences

- Fast, hermetic tests with no framework to maintain.
- UI is covered indirectly: the pages are thin server components over the tested
  domain/service layer. A browser-level UI test harness is a future addition.
