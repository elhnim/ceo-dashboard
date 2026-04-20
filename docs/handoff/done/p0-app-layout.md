# Task: Build App Shell Layout and Navigation

## Status
done

## Priority
P0 (blocking)

## Objective
Create the app shell — sidebar navigation, header, and responsive layout that wraps all dashboard pages.

## Context
The CEO Dashboard needs a consistent layout across all pages. On desktop, a sidebar shows navigation. On mobile, the sidebar collapses into a hamburger menu. The header shows the user's name/avatar and quick actions.

## What to Build

### 1. App shell components

**`src/components/layout/app-sidebar.tsx`** — Sidebar navigation:
- App logo/name: "CEO Dashboard" at the top
- Navigation items:
  - My Day (home icon) — route: `/`
  - Businesses (building icon) — route: `/businesses`
  - OKRs (target icon) — route: `/okrs`
  - Tasks (check-square icon) — route: `/tasks` (placeholder for Phase 3)
  - Calendar (calendar icon) — route: `/calendar` (placeholder for Phase 3)
  - Email (mail icon) — route: `/email` (placeholder for Phase 5)
- Active state highlighting based on current route
- Use shadcn Sidebar component (`@/components/ui/sidebar`)
- Collapsible on mobile (sheet/drawer)
- Use Lucide icons (already installed)

**`src/components/layout/app-header.tsx`** — Top header bar:
- Page title (dynamic, based on current route)
- User avatar + name (from NextAuth session)
- Sign out button in a dropdown menu
- Use shadcn Avatar, DropdownMenu components

**`src/components/layout/app-layout.tsx`** — Wrapper combining sidebar + header + content:
```typescript
interface AppLayoutProps {
  children: React.ReactNode
}
```

### 2. Update root layout

**`src/app/layout.tsx`**:
- Wrap authenticated pages with `AppLayout`
- Include `TooltipProvider` (required by shadcn sidebar)
- Include `Toaster` from sonner for notifications

### 3. Create placeholder pages

For routes that don't have content yet, create simple placeholder pages:
- `src/app/tasks/page.tsx` — "Tasks — Coming Soon"
- `src/app/calendar/page.tsx` — "Calendar — Coming Soon"
- `src/app/email/page.tsx` — "Email — Coming Soon"
- `src/app/okrs/page.tsx` — "OKRs — Coming Soon"
- `src/app/businesses/page.tsx` — "Businesses — Coming Soon"

Each placeholder should show the page title and a message like "This feature is coming in Phase X".

### 4. Responsive design
- Desktop: sidebar visible, full width content area
- Tablet: sidebar collapsible
- Mobile: sidebar as overlay sheet, header compact

## Acceptance Criteria
- [ ] Sidebar renders with all navigation items
- [ ] Active route is highlighted in sidebar
- [ ] Header shows user name and avatar from session
- [ ] Sign out works
- [ ] Sidebar collapses to hamburger on mobile
- [ ] All placeholder pages render with "Coming Soon" message
- [ ] Layout looks professional with shadcn defaults
- [ ] `npm run build` passes

## Relevant Files
- `src/components/ui/sidebar.tsx` — shadcn sidebar component
- `src/components/ui/avatar.tsx` — shadcn avatar
- `src/components/ui/dropdown-menu.tsx` — shadcn dropdown
- `src/components/ui/sheet.tsx` — shadcn sheet (mobile sidebar)
- `src/app/layout.tsx` — Root layout
- `CLAUDE.md` — Coding conventions (see layout/ folder structure)

## Constraints
- Use shadcn Sidebar component (already installed) — don't build custom sidebar
- Navigation items should use Next.js `Link` component
- Page title in header should update based on route
- Follow the component folder structure in CLAUDE.md: `src/components/layout/`
- The sidebar navigation items for Tasks, Calendar, Email are placeholders — they'll be implemented later

## Notes (filled by Codex on completion)
- All layout components created: app-sidebar, app-header, app-layout, coming-soon-page
- Root layout updated with SidebarProvider, TooltipProvider, Toaster
- All 5 placeholder pages created with phase-appropriate messaging
- Responsive sidebar with collapsible icon mode and rail
- Dynamic page titles in header based on current route
- Build passes cleanly (verified 2026-04-20)
