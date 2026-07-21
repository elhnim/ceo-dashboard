# ADR 0001 — Founder Console stack & architecture

- Status: Accepted
- Date: 2026-07-21

## Context

Founder Console is the first working application of a future platform for
intelligent organizations. Its purpose is to let one Product Director supervise
a small team of persistent AI officers — review deliverables, resolve decisions,
and understand progress — from web and mobile, with low cognitive load.

The repository originally held an unrelated half-built product (a CEO
Dashboard). The Product Director confirmed Founder Console is a **new project**
and that the old code should be removed — so the repository was reset to
Founder Console as the sole application at the root.

## Decision

**Adopt a modern Next.js/TypeScript stack with Founder Console at the root.**

- **Next.js 16 App Router + React 19 + TypeScript strict.** Gives responsive
  web, server APIs, a clear path to future auth and real-time, and lets the
  pure domain layer be reused later in an iOS target.
- **Tailwind v4 + shadcn/ui** for a calm, premium, monochrome executive
  aesthetic (the design tokens are grayscale — no neon AI look).
- **Founder Console is the whole app at `/`.** The prior CEO Dashboard pages,
  modules, and their dependencies (Supabase, NextAuth, Microsoft Graph, PWA,
  Netlify functions) were deleted. Internally the code is namespaced under
  `console` (`src/lib/console`, `src/components/console`, `src/types/console`)
  as a tidy module boundary.
- **Modular boundaries** matching the brief: `domain` (types, enums,
  validation, pure logic, transitions), `persistence`, `integrations`,
  `services`, `ea`, and the app/route/component layers. Domain logic never
  imports a vendor SDK; the UI never touches the repository directly.
- **Roles are modelled separately from the people filling them** (Person ↔ Role
  via OfficerAssignment), mirroring the long-term platform.
- **Enums as `as const` objects + union types**, not the TS `enum` keyword — safe
  under native type-stripping, tree-shakeable, and idiomatic.

## Consequences

- Zero new runtime dependencies were added for the MVP.
- The domain layer is pure and independently testable (Node's built-in test
  runner — see ADR 0003).
- Founder Console is reachable at `/` and is not gated by authentication yet.
  Authentication is a documented future capability.
- Future platform capabilities (real agents, notifications, voice, source
  control, knowledge, deployment) have typed provider interfaces with mock
  adapters only (see ADR 0002).
