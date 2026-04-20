# Task: Build My Day Landing Page Shell

## Status
backlog

## Priority
P1 (high)

## Objective
Build the "My Day" landing page — the home screen the CEO sees when opening the app. For now, it shows a greeting, today's date, placeholder widgets, and active OKR progress.

## Context
"My Day" is the command center. It will eventually show tasks, calendar, email count, and daily priorities. For this phase, we build the layout and shell with placeholder widgets. Real data integrations come in later phases.

The design should reduce cognitive load — clean, spacious, calming. Not a cluttered dashboard.

## What to Build

### 1. My Day page

**`src/app/page.tsx`** (the home route):
- Greeting: "Good morning/afternoon/evening, {firstName}" (from session)
- Today's date: formatted nicely (e.g., "Sunday, 20 April 2026")
- Layout: responsive grid of widget cards

### 2. Widget layout

Desktop (2 columns):
```
[Do This Next          ] [Top 3 Priorities     ]
[Calendar Time Blocks  ] [Active OKRs          ]
[Urgent Emails         ] [Quick Actions         ]
```

Mobile (single column), same widgets stacked.

### 3. Widget components

All widgets go in `src/components/shared/`:

**`DashboardWidget.tsx`** — Reusable widget wrapper:
```typescript
interface DashboardWidgetProps {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
}
```
Uses shadcn Card with a consistent header style.

**`DoThisNextWidget.tsx`** — Placeholder:
- Large, prominent card
- Shows: "No priority set yet"
- Button: "Set up your morning kickoff" (links to future daily ritual)
- This widget should stand out visually — it's the most important

**`TopPrioritiesWidget.tsx`** — Placeholder:
- Numbered list (1, 2, 3) with empty slots
- Message: "Complete your morning kickoff to set priorities"

**`CalendarWidget.tsx`** — Placeholder:
- Shows "Calendar — Coming in Phase 3"
- Placeholder time block visualization (just grey blocks)

**`ActiveOKRsWidget.tsx`** — Live data (if OKRs exist):
- Fetches active objectives from Supabase
- Shows progress bars for each active objective
- Groups by business (with business color indicator)
- Empty state: "No active OKRs. Create objectives in the OKRs section."

**`UrgentEmailWidget.tsx`** — Placeholder:
- Shows "Email — Coming in Phase 5"
- Placeholder count badge

**`QuickActionsWidget.tsx`**:
- Grid of quick action buttons:
  - "Add Business" → navigates to businesses page
  - "Create OKR" → navigates to OKRs page
  - "View Tasks" → navigates to tasks page (placeholder)
  - "Check Calendar" → navigates to calendar page (placeholder)

### 4. Greeting logic

**`src/lib/greeting.ts`**:
```typescript
export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-AU', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
```

## Acceptance Criteria
- [ ] Landing page shows personalized greeting with user's first name
- [ ] Today's date is displayed
- [ ] All widget cards render in a responsive grid
- [ ] "Do This Next" widget is visually prominent
- [ ] Active OKRs widget fetches real data from Supabase (shows empty state if none)
- [ ] Placeholder widgets clearly indicate upcoming features
- [ ] Quick actions navigate to correct pages
- [ ] Mobile layout: single column, stacked widgets
- [ ] Desktop layout: 2-column grid
- [ ] Clean, calming design — not cluttered
- [ ] `npm run build` passes

## Relevant Files
- `src/app/page.tsx` — Home page (replace default Next.js content)
- `src/types/database.ts` — Objective types (for OKR widget)
- `src/lib/supabase/server.ts` — Server client (for fetching OKRs)
- `src/components/ui/card.tsx` — shadcn Card
- `src/components/ui/badge.tsx` — shadcn Badge
- `src/components/ui/button.tsx` — shadcn Button
- `CLAUDE.md` — Coding conventions

## Constraints
- This is the first thing the CEO sees — it must feel calming and focused, not overwhelming
- Use muted colors, plenty of whitespace, clear typography
- "Do This Next" should be the most visually prominent element
- Follow CLAUDE.md component structure: `src/components/shared/`
- Lucide icons for widget headers
- Server Component for the page, Client Components only for interactive widgets

## Notes (filled by Codex on completion)
_Implementation notes, decisions made, anything to review._
