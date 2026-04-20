# Task: Build Vision/Mission/Values Editor with Version History

## Status
done

## Priority
P1 (high)

## Objective
Build the VMV (Vision, Mission, Values) editor for each business, with version history so the user can track how strategic direction evolves over time.

## Context
Each business has a vision, mission, and values statement. When updated, the previous version is automatically archived by the database trigger. The business detail page needs a real VMV workflow instead of the earlier placeholder tab.

## What to Build

### 1. VMV service layer

**`src/lib/services/vmv.ts`**:
- `getVMV(businessId)`
- `upsertVMV(businessId, data)`
- `getVMVHistory(businessId)`
- `getVMVVersion(businessId, version)`

### 2. API routes

**`src/app/api/businesses/[id]/vmv/route.ts`**:
- `GET` - get current VMV for a business
- `PUT` - update VMV and rely on the database trigger for archiving

**`src/app/api/businesses/[id]/vmv/history/route.ts`**:
- `GET` - get all VMV versions for a business in descending version order

### 3. VMV tab on business detail page

The VMV tab on `src/app/businesses/[id]/page.tsx`:
- Shows current vision, mission, and values
- Supports edit mode with save and cancel actions
- Shows a success toast on save
- Displays version history below the editor

### 4. VMV components

**`src/components/businesses/VMVEditor.tsx`**:
- Three labeled text areas
- Read mode and edit mode
- Save and cancel actions
- Current version label

**`src/components/businesses/VMVHistory.tsx`**:
- List of archived versions
- Expandable entries

**`src/components/businesses/VMVVersionCard.tsx`**:
- Single version summary and expanded content view

### 5. Integration with business detail page

The business detail page tabs now render the VMV editor and history instead of a placeholder.

## Acceptance Criteria
- [x] Can view current vision, mission, and values for a business
- [x] Can edit and save all three fields
- [x] Saving creates a new version (version number increments)
- [x] Previous versions appear in the history timeline
- [x] Can expand a history entry to see full VMV content at that version
- [x] First save on a new business creates version 1
- [x] Toast notification on successful save
- [x] Empty state: "No strategic profile set yet. Click Edit to define your vision, mission, and values."
- [x] `npm run build` passes

## Relevant Files
- `src/lib/services/vmv.ts` - VMV reads, upserts, and history lookups
- `src/app/api/businesses/[id]/vmv/route.ts` - Current VMV API
- `src/app/api/businesses/[id]/vmv/history/route.ts` - VMV history API
- `src/app/businesses/[id]/page.tsx` - Business detail page integration
- `src/components/businesses/VMVEditor.tsx` - VMV editing UI
- `src/components/businesses/VMVHistory.tsx` - VMV history list
- `src/components/businesses/VMVVersionCard.tsx` - VMV version entry

## Constraints
- The database trigger handles versioning automatically
- VMV is a 1:1 relationship with business, so the app uses upsert behavior
- History is append-only
- Use shadcn components for the UI

## Notes (filled by Codex on completion)
- Added a dedicated VMV service layer in `src/lib/services/vmv.ts` for current profile reads, upserts, version history queries, and schema-cache-aware error handling.
- Implemented REST endpoints at `/api/businesses/[id]/vmv` and `/api/businesses/[id]/vmv/history` to power the editor and version timeline.
- Replaced the placeholder VMV tab with a real editor flow: read mode, edit mode, save/cancel actions, success toast, and automatic refresh of the current profile plus archived history after each update.
- Built reusable VMV presentation components for the editor, version history list, and collapsible version cards so earlier strategic snapshots can be reviewed without leaving the page.
- Integrated the VMV tab into `src/app/businesses/[id]/page.tsx` with graceful fallback messaging if Supabase has not yet exposed the VMV tables through the Data API schema cache.
- Version numbering remains delegated to the database trigger as designed; the app only upserts the current profile and reads back the resulting version.
- Verification: `npm run lint` and `npm run build` both pass.
