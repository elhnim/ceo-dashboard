# Task: Build My Day Landing Page Shell

## Status
done

## Priority
P1 (high)

## Objective
Build the "My Day" landing page shell. It is the home screen the CEO sees when opening the app, with a greeting, today's date, placeholder widgets, and active OKR progress.

## Context
"My Day" is the command center. It will eventually show tasks, calendar, email count, and daily priorities. For this phase, we built the layout and shell with placeholder widgets and live OKR progress.

The design should reduce cognitive load by feeling clean, spacious, and calming rather than like a cluttered dashboard.

## What to Build

### 1. My Day page

**`src/app/page.tsx`** (the home route):
- Greeting: "Good morning/afternoon/evening, {firstName}" (from session)
- Today's date: formatted nicely (for example, "Sunday, 20 April 2026")
- Layout: responsive grid of widget cards

### 2. Widget layout

Desktop (2 columns):
```
[Do This Next          ] [Top 3 Priorities     ]
[Calendar Time Blocks  ] [Active OKRs          ]
[Urgent Emails         ] [Quick Actions        ]
```

Mobile (single column), same widgets stacked.

### 3. Widget components

All widgets go in `src/components/shared/`:

**`DashboardWidget.tsx`** - Reusable widget wrapper

**`DoThisNextWidget.tsx`** - Placeholder:
- Large, prominent card
- Shows: "No priority set yet"
- Button: "Set up your morning kickoff" (links to future daily ritual)

**`TopPrioritiesWidget.tsx`** - Placeholder:
- Numbered list (1, 2, 3) with empty slots
- Message: "Complete your morning kickoff to set priorities"

**`CalendarWidget.tsx`** - Placeholder:
- Shows "Calendar - Coming in Phase 3"
- Placeholder time block visualization

**`ActiveOKRsWidget.tsx`** - Live data:
- Fetches active objectives from Supabase
- Shows progress bars for each active objective
- Groups by business with a business color indicator
- Empty state: "No active OKRs. Create objectives in the OKRs section."

**`UrgentEmailWidget.tsx`** - Placeholder:
- Shows "Email - Coming in Phase 5"
- Placeholder count badge

**`QuickActionsWidget.tsx`**:
- Grid of quick action buttons
- "Add Business" navigates to businesses page
- "Create OKR" navigates to OKRs page
- "View Tasks" navigates to tasks page
- "Check Calendar" navigates to calendar page

### 4. Greeting logic

**`src/lib/greeting.ts`**:
- `getGreeting()` returns the correct time-of-day greeting
- `formatDate()` formats the date for the app header

## Acceptance Criteria
- [x] Landing page shows personalized greeting with user's first name
- [x] Today's date is displayed
- [x] All widget cards render in a responsive grid
- [x] "Do This Next" widget is visually prominent
- [x] Active OKRs widget fetches real data from Supabase (shows empty state if none)
- [x] Placeholder widgets clearly indicate upcoming features
- [x] Quick actions navigate to correct pages
- [x] Mobile layout: single column, stacked widgets
- [x] Desktop layout: 2-column grid
- [x] Clean, calming design - not cluttered
- [x] `npm run build` passes

## Relevant Files
- `src/app/page.tsx` - Home page
- `src/lib/greeting.ts` - Greeting and date formatting helpers
- `src/components/shared/` - Widget components
- `src/lib/services/objectives.ts` - Active objective fetch for OKR widget
- `src/lib/services/businesses.ts` - Business grouping data for OKR widget

## Constraints
- This is the first thing the CEO sees - it should feel calming and focused
- Use muted colors, plenty of whitespace, and clear typography
- "Do This Next" should be the most visually prominent element
- Keep the page as a Server Component and limit Client Components to interactive widgets

## Notes (filled by Codex on completion)
- Replaced the default home page with a server-rendered "My Day" dashboard that greets the signed-in user by first name and formats the current date.
- Added a reusable `DashboardWidget` shell plus focused placeholder widgets for daily kickoff, priorities, calendar, urgent email, and quick actions under `src/components/shared/`.
- Wired quick actions to the current app routes and used a spacious two-column desktop grid that collapses cleanly to one column on smaller screens.
- Built `ActiveOKRsWidget` against live Supabase data, grouping active objectives by business and gracefully surfacing empty-state or schema-setup messaging when OKRs are unavailable.
- Added `src/lib/greeting.ts` to centralize the greeting and date-formatting logic.
- Verification: `npm run lint` and `npm run build` both pass.
