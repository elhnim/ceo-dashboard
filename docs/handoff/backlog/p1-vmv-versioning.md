# Task: Build Vision/Mission/Values Editor with Version History

## Status
backlog

## Priority
P1 (high)

## Objective
Build the VMV (Vision, Mission, Values) editor for each business, with full version history so the user can track how their strategic direction evolves over time.

## Context
Each business has a vision, mission, and values statement. When updated, the previous version is automatically archived (handled by a database trigger). The user should be able to view and compare past versions. This is part of the business detail page.

## What to Build

### 1. VMV service layer

**`src/lib/services/vmv.ts`**:
```typescript
import { BusinessVMV, BusinessVMVUpdate, BusinessVMVHistory } from '@/types/database'

export async function getVMV(businessId: string): Promise<BusinessVMV | null>
export async function upsertVMV(businessId: string, data: BusinessVMVUpdate): Promise<BusinessVMV>
export async function getVMVHistory(businessId: string): Promise<BusinessVMVHistory[]>
export async function getVMVVersion(businessId: string, version: number): Promise<BusinessVMVHistory | null>
```

### 2. API routes

**`src/app/api/businesses/[id]/vmv/route.ts`**:
- `GET` — get current VMV for business
- `PUT` — update VMV (triggers auto-archive in database)

**`src/app/api/businesses/[id]/vmv/history/route.ts`**:
- `GET` — get all VMV versions for business (ordered by version desc)

### 3. VMV tab on business detail page

**`src/app/businesses/[id]/vmv/page.tsx`** (or as a tab component):
- Three text areas: Vision, Mission, Values
- Each shows current content with an "Edit" toggle
- Save button that updates all three at once
- Success toast on save: "Strategic profile updated (v{version})"
- Below the editor: version history timeline

### 4. VMV components

**`src/components/businesses/VMVEditor.tsx`**:
- Three labeled text areas (vision, mission, values)
- Read mode (display) and edit mode (text areas)
- Save/Cancel buttons in edit mode
- Shows current version number

**`src/components/businesses/VMVHistory.tsx`**:
- Timeline/list of past versions
- Each entry shows: version number, date, change note
- Click to expand and see the full VMV content for that version
- Visual diff indicator (optional): which fields changed

**`src/components/businesses/VMVVersionCard.tsx`**:
- Single version entry showing the vision/mission/values at that point in time
- Collapsible — shows summary when collapsed, full content when expanded

### 5. Integration with business detail page

The business detail page (`src/app/businesses/[id]/page.tsx`) should have tabs. The VMV tab should render the VMV editor and history. Wire up the VMV tab to show this content.

## Acceptance Criteria
- [ ] Can view current vision, mission, and values for a business
- [ ] Can edit and save all three fields
- [ ] Saving creates a new version (version number increments)
- [ ] Previous versions appear in the history timeline
- [ ] Can expand a history entry to see full VMV content at that version
- [ ] First save on a new business creates version 1
- [ ] Toast notification on successful save
- [ ] Empty state: "No strategic profile set yet. Click Edit to define your vision, mission, and values."
- [ ] `npm run build` passes

## Relevant Files
- `src/types/database.ts` — BusinessVMV and BusinessVMVHistory types
- `src/lib/supabase/server.ts` — Server Supabase client
- `src/app/businesses/[id]/page.tsx` — Business detail page (add VMV tab)
- `src/components/ui/textarea.tsx` — shadcn Textarea
- `src/components/ui/tabs.tsx` — shadcn Tabs
- `src/components/ui/card.tsx` — shadcn Card
- `CLAUDE.md` — Coding conventions
- `docs/architecture/database-schema.sql` — VMV table schema and triggers

## Constraints
- The database trigger handles versioning automatically — don't implement version incrementing in app code
- VMV is a 1:1 relationship with business (upsert, not insert multiple)
- History is append-only — no editing or deleting history entries
- Follow module structure in CLAUDE.md
- Use shadcn components for all UI elements

## Notes (filled by Codex on completion)
_Implementation notes, decisions made, anything to review._
