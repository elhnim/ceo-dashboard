# CEO Dashboard — Requirements Spec v1

## Purpose

Personal executive function support tool for a multi-business CEO with ADHD. Reduces cognitive load, surfaces what matters, and supports focus.

## User

- Single user (Minh Hoang)
- Microsoft SSO authentication

## Tech Stack

- **Frontend:** Next.js (React), Tailwind CSS + shadcn/ui
- **Database:** Supabase (Postgres)
- **Hosting:** Netlify
- **Code:** GitHub
- **Platform:** PWA (installable, offline-capable, push notifications)

---

## Landing Page — "My Day"

- **"Do This Next"** — single highlighted priority to reduce decision paralysis
- **Top 3 priorities** — selected during daily kickoff
- **Visual time-block view** — calendar events + tasks shown together so you can see where focused work fits
- **Active OKR progress bars** — current objectives at a glance
- **Urgent email count** — with quick triage access

---

## Core Modules

### 1. Businesses (Configurable)

Add, edit, remove businesses dynamically. Each business has:

- **Vision, Mission, Values** — editable text with version history (track strategic evolution over time)
- **Financials** — monthly sync from Xero
- **OKRs** — native CRUD (created and managed in-app)
- **Pulse Data** — native CRUD, data sources configurable (DEFERRED)

### 2. Tasks (Microsoft To Do Sync)

- Full CRUD, synced bidirectionally with Microsoft To Do
- **Eisenhower Matrix view** — drag & drop tasks into urgent/important quadrants
- **"Do This Next" engine** — surfaces the single most important task

### 3. Calendar (Outlook Sync)

- Full CRUD, synced with Outlook Calendar
- **Visual time-block view** — displayed alongside tasks on My Day

### 4. Email Triage (Outlook)

- View urgent/important emails from Outlook inbox
- **Quick actions:** Reply Later, Delegate, Archive, 5-min Action
- Filter for urgent/important only (not the full inbox)

### 5. Daily Rituals

- **Morning Kickoff:** Guided 2-minute flow to review the day and pick top 3 priorities
- **End-of-Day Review:** What got done, what moves to tomorrow

### 6. Weekly Review

- Committed vs completed comparison
- OKR progress snapshot
- Cross-business health summary

### 7. Push Notifications

- Calendar event reminders
- Overdue task alerts
- OKR deadline approaching
- **Batched at smart intervals** — supportive, not overwhelming

---

## Deferred Features

- Monday.com integration (projects/initiatives)
- Pulse data source configuration

---

## Design Principles

- **Reduce cognitive load** — show less, not more
- **Support focus** — one thing at a time when needed
- **Gentle nudges** — notifications that feel supportive, not nagging
- **Visual time** — ADHD brains need to see time, not just read it
- **Quick triage** — fast actions to process and move on

---

## Working Principles

1. **Vertical slices** — Build one complete feature end-to-end (DB to screen), test it, then move to the next. Something working after every session.
2. **Foundation first** — Auth, database schema, project scaffold, deployment pipeline before any features. These are expensive to change later.
3. **Living CLAUDE.md** — Maintained project instruction file so every session picks up exactly where we left off.
4. **One feature per session** — Implement, then test. Short feedback loops catch bugs early.
5. **Spec is source of truth** — Requirements change? Update the spec first, then the code.
6. **Modular architecture** — Each module (Tasks, Calendar, Email, OKRs, Businesses) is independent. Changing one doesn't ripple across others.
7. **API abstraction layer** — Microsoft Graph, Xero, Supabase all behind service interfaces. Swap a provider by changing one file, not fifty.
8. **Test integration points first** — Most bugs live in the sync between the app and external APIs.
9. **Don't gold-plate** — Get it working, then make it pretty. shadcn defaults are good enough for v1.
10. **You decide scope, I flag risk** — Small changes just get done. Structural shifts get flagged with impact before code is touched.

---

## Team Structure

### Roles

**Minh Hoang — The Client**
- Describes needs, gives feedback, tests the final product
- Does not manage agents, backlog, or technical decisions
- Only involved when: (1) a product decision needs client input, (2) a feature is ready to test

**Claude Code — Product Owner + Tech Lead (Brain)**
- **Does NOT write code** — thinks, plans, designs, reviews, tests
- Interviews the client to gather and refine requirements
- Researches best practices, competitor features, and UX patterns
- Writes user stories with acceptance criteria
- Prioritises the backlog and sets product direction
- Designs architecture, schemas, API contracts, types, and interfaces
- Defines folder structure, naming conventions, and coding patterns
- Creates detailed implementation tasks for Codex
- Reviews all Codex PRs/output before merging
- Tests features and reports bugs back as new tasks
- Makes product and technical decisions autonomously
- Owns CLAUDE.md, SPEC.md, and all documentation

**Codex — Full-Stack Developer (Hands)**
- **Does ALL the coding** — has more usage capacity
- Picks up tasks from `docs/handoff/backlog/`
- Implements features, API routes, UI components, database migrations
- Writes tests
- **Image generation** — app icons, illustrations, assets
- **Audio generation** — notification sounds, UI feedback sounds
- Creates PRs against the main branch
- Leaves implementation notes in completed task files
- Can work on multiple tasks in parallel

### Workflow

```
Claude (thinks) → Creates task with full spec → Pushes to GitHub
                                                      ↓
Client points Codex at task  ←  or  →  Codex picks up from backlog
                                                      ↓
                                              Codex implements + PR
                                                      ↓
                                         Claude reviews PR + merges
                                                      ↓
                                           Claude tests the feature
                                                      ↓
                                    Client tests  ←  or  →  New bugs → new tasks
```

### What Claude Produces (Not Code)

1. **Architecture documents** — schemas, ERDs, API contracts, type definitions
2. **Task files** — detailed implementation briefs in `docs/handoff/backlog/`
3. **Code review** — feedback on Codex PRs
4. **Bug reports** — when testing reveals issues
5. **Spec updates** — when requirements evolve

### Task Quality Standard

Every task Claude creates for Codex must include:
- Clear objective (what to build)
- Full context (why it exists, how it fits in)
- Exact file paths to create or modify
- Type definitions and interfaces to implement
- API contracts (request/response shapes)
- Database schema (if applicable)
- Acceptance criteria (testable checklist)
- Constraints (what NOT to touch, patterns to follow)
- Reference to CLAUDE.md for coding conventions

### Handoff Protocol

All work is coordinated through `docs/handoff/`:

- `docs/handoff/backlog/` — Tasks ready for Codex to pick up
- `docs/handoff/in-progress/` — Tasks currently being worked on
- `docs/handoff/done/` — Completed tasks with notes for review
- `docs/handoff/HANDOFF-README.md` — Conventions and task template

Each task file is named: `[priority]-[short-kebab-name].md`

### Autonomous Operation

The team operates without client involvement:
1. Claude plans the next feature based on the build plan
2. Claude creates detailed tasks and pushes to GitHub
3. Client triggers Codex on the task (only manual step)
4. Codex implements and creates PR
5. Claude reviews, merges, and tests
6. If bugs found, Claude creates new fix tasks → repeat
7. When a phase is complete, Claude notifies the client to test
