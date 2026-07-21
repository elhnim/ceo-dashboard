# Founder Console — documentation

The primary getting-started guide, screen list, and architecture overview live
in the [root README](../README.md). This folder holds the deeper material.

## Contents

- [Implementation log](IMPLEMENTATION-LOG.md) — what was built and the decisions
  taken along the way.
- Architecture decision records:
  - [0001 — Stack & architecture](adr/0001-stack-and-architecture.md)
  - [0002 — Persistence & integration boundaries](adr/0002-persistence-and-integrations.md)
  - [0003 — Testing approach](adr/0003-testing.md)

## Quick reference

- Run: `npm install && npm run dev`, then open <http://localhost:3000>.
- Test: `npm test` (domain, validation, workflow, EA, seed integrity).
- Persistence: `.data/founder-console.json` (git-ignored, seeded on first load;
  delete to reset).
