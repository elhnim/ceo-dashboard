# ADR 0001 — Founder Console stack & architecture

- Status: Accepted
- Date: 2026-07-21

## Context

Founder Console is the first working application of a future platform for
intelligent organizations. Its purpose is to let one Product Director supervise
a small team of persistent AI officers — review deliverables, resolve decisions,
and understand progress — from web and mobile, with low cognitive load.

It is being built inside an existing repository (the CEO Dashboard) that already
ships Next.js 16 (App Router), React 19, TypeScript (strict), Tailwind v4, and
shadcn/ui. We must keep that application building and running.

## Decision

**Reuse the existing stack rather than introduce a parallel one.**

- **Next.js 16 App Router + React 19 + TypeScript strict.** Gives responsive
  web, server APIs, a clear path to future auth and real-time, and lets the
  pure domain layer be reused later in an iOS target.
- **Tailwind v4 + shadcn/ui** for a calm, premium, monochrome executive
  aesthetic (the design tokens are already grayscale — no neon AI look).
- **Additive, non-destructive integration.** Founder Console lives under a
  dedicated namespace (`/console`, `src/lib/console`, `src/components/console`,
  `src/types/console`) so the CEO Dashboard modules are untouched.
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
- Founder Console is reachable at `/console` and is not gated by Microsoft SSO
  yet (see the README). Authentication is a documented future capability.
- Future platform capabilities (real agents, notifications, voice, source
  control, knowledge, deployment) have typed provider interfaces with mock
  adapters only (see ADR 0002).
