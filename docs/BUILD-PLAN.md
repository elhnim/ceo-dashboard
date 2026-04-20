# CEO Dashboard — Build Plan v1

## Guiding Principle

Ship a usable app as early as possible. Each phase ends with something you can open and use. Later phases add depth, not breadth.

---

## Phase 0: Foundation

**Goal:** Deployable skeleton with auth. Nothing works yet, but the infrastructure is solid.

**Why first:** Everything depends on this. Changing it later is the most expensive mistake.

| Task | Agent | Depends On |
|------|-------|------------|
| Init Next.js project + Tailwind + shadcn/ui | Orchestrator | — |
| GitHub repo setup | Orchestrator | — |
| Supabase project + initial schema | Orchestrator | — |
| Netlify deployment pipeline | Orchestrator | GitHub repo |
| Microsoft SSO (MSAL) | Orchestrator | Next.js scaffold |
| PWA manifest + service worker shell | Sub-agent | Next.js scaffold |
| CLAUDE.md with conventions | Orchestrator | All above |

**Parallelism:** PWA manifest can run as a sub-agent once scaffold exists.

**Deliverable:** Login with Microsoft, see an empty dashboard shell, deployed on Netlify.

---

## Phase 1: Businesses

**Goal:** You can add your 4 businesses with their strategic profiles.

**Why second:** Businesses are the core entity. OKRs, financials, and pulse all hang off them.

| Task | Agent | Depends On |
|------|-------|------------|
| Supabase schema: businesses, vision/mission/values with version history | Orchestrator | Phase 0 |
| Business CRUD API routes | Sub-agent A | Schema |
| Business CRUD UI (list, add, edit, delete) | Sub-agent B | Schema + API contracts |
| Vision/Mission/Values editor with version history UI | Sub-agent C | Schema + API contracts |

**Parallelism:** After orchestrator defines schema + API contracts, 3 sub-agents build API, list UI, and VMV editor simultaneously.

**Deliverable:** Add your businesses, write their vision/mission/values, view change history.

---

## Phase 2: OKRs

**Goal:** Define and track OKRs per business.

**Why now:** You said active OKRs are on the landing page. We need the data before building My Day.

| Task | Agent | Depends On |
|------|-------|------------|
| Supabase schema: objectives, key_results | Orchestrator | Phase 1 |
| OKR CRUD API routes | Sub-agent A | Schema |
| OKR management UI (create, edit, progress, archive) | Sub-agent B | Schema + API contracts |
| OKR progress bar component | Sub-agent C | API contracts |

**Parallelism:** 3 sub-agents after schema + contracts defined.

**Deliverable:** Create OKRs with key results, update progress, see progress bars.

---

## Phase 3: Microsoft Integration (Tasks + Calendar)

**Goal:** See and manage your tasks and calendar from the dashboard.

**Why now:** These are the core of "My Day." Heavy integration work — get it stable early.

| Task | Agent | Depends On |
|------|-------|------------|
| Microsoft Graph API service layer (shared auth, token management) | Orchestrator | Phase 0 (MSAL) |
| Task service (To Do CRUD via Graph API) | Sub-agent A | Graph service layer |
| Calendar service (Outlook CRUD via Graph API) | Sub-agent B | Graph service layer |
| Task list UI + Eisenhower Matrix view | Sub-agent C | Task service contracts |
| Calendar time-block view UI | Sub-agent D | Calendar service contracts |

**Parallelism:** After orchestrator builds the shared Graph service layer, 4 sub-agents work simultaneously — 2 on services, 2 on UI.

**Deliverable:** View, create, edit, complete tasks (synced to To Do). View, create, edit calendar events (synced to Outlook). Eisenhower Matrix drag & drop.

---

## Phase 4: My Day (Landing Page)

**Goal:** The home screen that ties everything together.

**Why now:** All the data sources exist. Now we compose them into your daily command center.

| Task | Agent | Depends On |
|------|-------|------------|
| My Day layout + responsive design | Orchestrator | Phases 1-3 |
| "Do This Next" engine (priority algorithm) | Sub-agent A | Task service |
| Top 3 priorities selector component | Sub-agent B | Task service |
| Visual time-block view (tasks + calendar merged) | Sub-agent C | Task + Calendar services |
| Active OKR summary widget | Sub-agent D | OKR service |
| Urgent email count badge (read-only for now) | Sub-agent E | Graph service layer |

**Parallelism:** 5 sub-agents, all building independent widgets to a shared layout contract.

**Deliverable:** Open the app, see your day — top priority, calendar, tasks, OKR progress, email count.

---

## Phase 5: Email Triage

**Goal:** Process urgent emails without leaving the dashboard.

| Task | Agent | Depends On |
|------|-------|------------|
| Email service (Outlook read/actions via Graph API) | Sub-agent A | Graph service layer |
| Email triage UI (list + quick actions) | Sub-agent B | Email service contracts |
| Urgent/important filter logic | Sub-agent C | Email service contracts |

**Parallelism:** 3 sub-agents after contracts defined.

**Deliverable:** View urgent emails, take quick actions (Reply Later, Delegate, Archive, 5-min Action).

---

## Phase 6: Daily Rituals

**Goal:** Morning kickoff and end-of-day review flows.

| Task | Agent | Depends On |
|------|-------|------------|
| Morning Kickoff flow UI (guided wizard) | Sub-agent A | My Day components |
| End-of-Day Review flow UI | Sub-agent B | Task service |
| Daily state persistence (Supabase) | Orchestrator | Schema |

**Parallelism:** 2 sub-agents for the two flows after schema defined.

**Deliverable:** Guided morning routine to pick priorities. Evening review of what got done.

---

## Phase 7: Weekly Review

**Goal:** Reflect on the week across all businesses.

| Task | Agent | Depends On |
|------|-------|------------|
| Weekly review data aggregation API | Sub-agent A | All services |
| Committed vs completed view | Sub-agent B | API contracts |
| OKR weekly snapshot | Sub-agent C | OKR service |
| Cross-business health summary | Sub-agent D | Business + OKR services |

**Parallelism:** 4 sub-agents building independent dashboard panels.

**Deliverable:** One page showing your week — what you planned vs did, OKR movement, business health.

---

## Phase 8: Push Notifications

**Goal:** Gentle, batched reminders on your phone.

| Task | Agent | Depends On |
|------|-------|------------|
| Service worker push notification setup | Orchestrator | PWA shell |
| Notification scheduling engine | Sub-agent A | All services |
| Notification preferences UI | Sub-agent B | Schema |
| Notification batching logic | Sub-agent A | Scheduling engine |

**Deliverable:** Push notifications for calendar, tasks, OKR deadlines. Batched, not spammy.

---

## Phase 9: Polish & Creative

**Goal:** Make it feel like a real product, not a prototype.

| Task | Agent | Depends On |
|------|-------|------------|
| App icon + PWA splash screens | Codex | — |
| Notification sounds (gentle, supportive tone) | Codex | — |
| Loading states, empty states, error states | Sub-agents (parallel) | All UI |
| Responsive polish (phone + tablet + desktop) | Sub-agents (parallel) | All UI |
| Performance optimization | Orchestrator | Everything |

**Parallelism:** Codex generates creative assets in parallel with UI polish sub-agents.

**Deliverable:** Polished, installable PWA that feels professional and calming.

---

## Deferred (Future Phases)

- **Monday.com integration** — Pull projects/initiatives
- **Pulse data sources** — Configurable external data feeds
- **Xero financials** — Monthly sync per business

---

## Summary

| Phase | What You Get | Est. Parallel Agents |
|-------|-------------|---------------------|
| 0 — Foundation | Login + empty shell on Netlify | 1-2 |
| 1 — Businesses | Add businesses + strategic profiles | 3 |
| 2 — OKRs | Track objectives per business | 3 |
| 3 — Microsoft | Tasks + Calendar sync | 4 |
| 4 — My Day | Your daily command center | 5 |
| 5 — Email | Triage urgent emails | 3 |
| 6 — Rituals | Morning + evening flows | 2 |
| 7 — Weekly Review | Reflect on the week | 4 |
| 8 — Notifications | Gentle push reminders | 2 |
| 9 — Polish | Icons, sounds, responsive | Codex + 3 |
