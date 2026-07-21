@AGENTS.md

# Founder Console — Project Conventions

Founder Console is a calm executive cockpit for one Product Director to
supervise a small team of persistent AI officers — review deliverables, resolve
decisions, answer questions, and understand organizational progress from web and
mobile, with the lowest possible cognitive load.

It is a standalone application. It runs locally with no external services or
credentials.

## Stack
- Next.js 16 (App Router), React 19, TypeScript (strict)
- Tailwind CSS v4, shadcn/ui (base-nova style, Lucide icons), next-themes
- Local JSON persistence behind a repository port (no external database)
- `sonner` for toasts
- Deployable on Netlify (`@netlify/plugin-nextjs`)

## Project Structure

```
src/
├── app/                     # Next.js App Router — Founder Console lives at root
│   ├── layout.tsx           # Root layout (ThemeProvider + ConsoleShell + Toaster)
│   ├── page.tsx             # Home — the executive morning brief
│   ├── decisions/page.tsx   # Decision queue
│   ├── officers/            # Officer directory + [id] detail
│   ├── work/                # Work board + [id] assignment detail
│   ├── activity/page.tsx    # Organization activity timeline
│   ├── ea/page.tsx          # Executive Assistant chat
│   ├── loading.tsx · error.tsx · not-found.tsx
│   └── api/                 # Route handlers (decisions, deliverables, work, ea, brief)
├── components/
│   ├── ui/                  # shadcn/ui (DO NOT MODIFY — managed by shadcn CLI)
│   └── console/             # Founder Console components (shell, cards, rows, client actions)
├── lib/
│   ├── utils.ts             # cn()
│   └── console/
│       ├── domain/          # enums · validation · logic (pure reads) · transitions (pure writes)
│       ├── persistence/     # repository port · local JSON adapter · founding seed
│       ├── integrations/    # provider interfaces · mock adapters
│       ├── ea/              # deterministic Executive Assistant (ConversationProvider)
│       ├── services/        # application service (the only thing routes/pages call)
│       └── format.ts        # UI formatting helpers
└── types/console/           # domain entity types

tests/console/               # node --test suite (+ zero-dep @/ resolution loader)
docs/                        # README, implementation log, ADRs
```

## Coding Rules

### TypeScript
- Strict mode — no `any` unless unavoidable.
- Use the `@/*` import alias (maps to `./src/*`).
- **Enums are `as const` objects + union types**, never the TS `enum` keyword
  (type-stripping safe for the test runner; bundler-friendly).
- Named exports (except Next.js pages/layouts which use default).

### Next.js
- Server Components by default — `"use client"` only for browser APIs, hooks,
  event handlers.
- Route handlers in `src/app/api/[resource]/route.ts`, returning `Response.json`
  with a `{ data, error }` shape and proper status codes.
- Dynamic route params arrive as `params: Promise<...>` — `await` them.
- Read `node_modules/next/dist/docs/` for current API docs — this version may
  differ from training data (see AGENTS.md).

### Architecture boundaries
- **The UI never touches the repository.** Pages and route handlers call the
  application service (`src/lib/console/services/console-service.ts`), which
  wraps pure transitions in serialized repository transactions.
- **Domain logic imports no vendor SDK.** External systems (AI models,
  notifications, source control, deployment, knowledge) are reachable only by
  implementing a provider interface in `src/lib/console/integrations/`.
- **Roles are modelled separately from the people filling them** (Person ↔ Role
  via OfficerAssignment).
- Keep all business entities strongly typed; put types in `src/types/console`.

### Styling
- Tailwind v4 utility classes; `cn()` from `@/lib/utils` to merge.
- Use shadcn/ui components from `@/components/ui`; do not modify them.
- Design direction: calm, premium, deliberate, low cognitive load. Avoid neon AI
  aesthetics, busy dashboards, and dense tables as the default view. Use
  progressive disclosure — summary first, detail on demand.

### Testing
- `npm test` runs the domain/validation/workflow/EA/seed suite via `node --test`
  (zero dependencies). Never claim completion without running it.

## Persistence
Local JSON at `.data/founder-console.json` (git-ignored), seeded on first load.
Delete it to reset. Swap `LocalJsonRepository` for a real database by
implementing `ConsoleRepository` — see `docs/adr/0002-persistence-and-integrations.md`.

## Out of scope (typed placeholders only)
Autonomous orchestration, voice, model routing, graph databases, GitHub/
deployment automation, multi-tenant SaaS, billing, and the full Organizational
Twin/Mind. Provider interfaces exist for these seams; do not implement them
without a present reason.
