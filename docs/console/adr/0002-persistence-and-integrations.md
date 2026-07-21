# ADR 0002 — Persistence & integration boundaries

- Status: Accepted
- Date: 2026-07-21

## Context

The brief requires local persistence, a replaceable database layer, and clean
integration seams so real AI agents (and other vendors) can be wired in later
without touching domain logic. The MVP must be runnable immediately, with no
external services or credentials.

## Decision

### Persistence: a repository port with a local JSON adapter

- `ConsoleRepository` (`src/lib/console/persistence/repository.ts`) is a thin
  port: `load()`, `save()`, and a serialized `transaction()` for atomic
  read-modify-write.
- `LocalJsonRepository` implements it against a single JSON file under `.data/`
  (git-ignored), seeded on first use. Transactions are serialized through an
  in-process promise chain so concurrent dev-server requests can't corrupt the
  file.
- **Domain semantics live in the service/transition layer, not the
  repository.** Swapping to SQLite/Postgres/Supabase means implementing this one
  interface — no domain or UI changes.

Trade-off: a JSON file is appropriate for local, single-user development. It is
not a production store (no concurrent multi-process writes, not suited to
serverless). That is acceptable for the MVP and the port makes the upgrade a
drop-in.

### Integrations: provider interfaces + mock adapters only

`src/lib/console/integrations/providers.ts` defines the seams named in the
brief: `ConversationProvider`, `AgentProvider`, `NotificationProvider`,
`VoiceProvider`, `SourceControlProvider`, `KnowledgeProvider`,
`DeploymentProvider`. For the MVP:

- `ConversationProvider` → a deterministic Executive Assistant that reads live
  state (`src/lib/console/ea/deterministic-ea.ts`). Replacing it with a real
  model is a one-file change.
- Every other provider is a local/no-op/placeholder adapter
  (`mock-adapters.ts`). `AgentProvider` is intentionally `null` — the MVP does
  not orchestrate real agents.

## Consequences

- The app runs with no credentials or network.
- No vendor SDK is imported by domain code.
- The out-of-scope platform capabilities exist as typed placeholders, not
  implementations.
