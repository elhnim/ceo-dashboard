# Task: Build Business CRUD (API + UI)

## Status
backlog

## Priority
P1 (high)

## Objective
Build the full CRUD for businesses — the user can add, view, edit, and delete businesses from the dashboard.

## Context
Businesses are the core entity in the CEO Dashboard. Everything else (OKRs, financials, VMV) hangs off a business. The user has ~4 businesses and needs to configure them through the app. The database table already exists in Supabase (created by task p0-supabase-setup).

## What to Build

### 1. Business service layer

**`src/lib/services/businesses.ts`**:
```typescript
import { Business, BusinessInsert, BusinessUpdate } from '@/types/database'

export async function getBusinesses(): Promise<Business[]>
export async function getBusiness(id: string): Promise<Business>
export async function createBusiness(data: BusinessInsert): Promise<Business>
export async function updateBusiness(id: string, data: BusinessUpdate): Promise<Business>
export async function deleteBusiness(id: string): Promise<void>
export async function reorderBusinesses(ids: string[]): Promise<void>
```

Use the Supabase server client. Query the `businesses` table. Order by `display_order`.

### 2. API routes

**`src/app/api/businesses/route.ts`**:
- `GET` — list all active businesses (ordered by display_order)
- `POST` — create a new business (body: BusinessInsert)

**`src/app/api/businesses/[id]/route.ts`**:
- `GET` — get single business by ID
- `PUT` — update business (body: BusinessUpdate)
- `DELETE` — soft delete (set is_active = false) or hard delete

All routes return `{ data, error }` format as defined in the types.

### 3. Business list page

**`src/app/businesses/page.tsx`**:
- Grid of business cards
- Each card shows: name, description, color indicator
- "Add Business" button opens a dialog
- Click a card to navigate to `/businesses/[id]`
- Empty state: "No businesses yet. Add your first business."

### 4. Business detail page

**`src/app/businesses/[id]/page.tsx`**:
- Business name (editable inline or via edit button)
- Description
- Color picker
- Tabs for: Overview, VMV (Vision/Mission/Values), OKRs
- VMV and OKR tabs show "Coming Soon" for now (built in separate tasks)
- Delete button with confirmation dialog

### 5. Business components

**`src/components/businesses/BusinessCard.tsx`**:
- Card showing business name, description, color stripe
- Click navigates to detail page

**`src/components/businesses/BusinessForm.tsx`**:
- Form for creating/editing a business
- Fields: name (required), description (optional), color (color picker or preset colors)
- Used in both create dialog and edit page

**`src/components/businesses/BusinessList.tsx`**:
- Grid layout of BusinessCards
- "Add Business" button
- Empty state

## Acceptance Criteria
- [ ] Can create a new business with name, description, color
- [ ] Can view list of all businesses as cards
- [ ] Can click a business to see its detail page
- [ ] Can edit business name, description, color
- [ ] Can delete a business (with confirmation)
- [ ] Empty state shows when no businesses exist
- [ ] API routes return proper status codes and error messages
- [ ] Responsive layout (mobile: single column, desktop: grid)
- [ ] Loading states while data is fetching
- [ ] `npm run build` passes

## Relevant Files
- `src/types/database.ts` — Business types (already created by p0-supabase-setup)
- `src/lib/supabase/server.ts` — Server Supabase client
- `src/components/ui/card.tsx` — shadcn Card
- `src/components/ui/dialog.tsx` — shadcn Dialog
- `src/components/ui/input.tsx` — shadcn Input
- `src/components/ui/button.tsx` — shadcn Button
- `CLAUDE.md` — Coding conventions

## Constraints
- Use Supabase server client for API routes
- Follow module structure: components in `src/components/businesses/`
- Use shadcn components — don't build custom form controls
- Business color should be one of a preset list (indigo, emerald, amber, rose, sky, violet, orange, teal) or a hex input
- Follow CLAUDE.md conventions

## Notes (filled by Codex on completion)
_Implementation notes, decisions made, anything to review._
