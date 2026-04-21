# Task: OKR Database Schema

## Status
done

## Priority
P2

## Objective
Create the Supabase database tables for OKRs (Objectives and Key Results) and the typed TypeScript definitions. No UI — schema and types only.

## Context
- Businesses table already exists (from p1-business-crud)
- OKRs belong to a business: each objective links to one business
- Key results belong to an objective
- Progress is a number 0–100 (percentage)
- This is a prerequisite for p2-okr-api and p2-okr-ui

## What to Build

### 1. SQL Migration — run via Supabase admin client

Create file `scripts/migrate-okr-schema.ts` that applies this SQL using the admin client (`@/lib/supabase/admin`):

```sql
create table if not exists objectives (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  title text not null,
  description text,
  time_period text not null, -- e.g. "Q2 2026", "H1 2026", "FY2026"
  status text not null default 'active' check (status in ('active', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists key_results (
  id uuid primary key default gen_random_uuid(),
  objective_id uuid not null references objectives(id) on delete cascade,
  title text not null,
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  unit text, -- e.g. "%", "$", "users", null for boolean
  target_value numeric,
  current_value numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-update updated_at on objectives
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger objectives_updated_at
  before update on objectives
  for each row execute function update_updated_at();

create trigger key_results_updated_at
  before update on key_results
  for each row execute function update_updated_at();

-- RLS (same open policy as other tables — single user app)
alter table objectives enable row level security;
alter table key_results enable row level security;

create policy "Allow all for authenticated" on objectives for all using (true);
create policy "Allow all for authenticated" on key_results for all using (true);
```

### 2. TypeScript Types — `src/types/okr.ts`

```typescript
export type ObjectiveStatus = "active" | "completed" | "cancelled"

export type KeyResult = {
  id: string
  objective_id: string
  title: string
  progress: number // 0-100
  unit: string | null
  target_value: number | null
  current_value: number | null
  created_at: string
  updated_at: string
}

export type Objective = {
  id: string
  business_id: string
  title: string
  description: string | null
  time_period: string
  status: ObjectiveStatus
  created_at: string
  updated_at: string
  key_results?: KeyResult[]
}

export type ObjectiveWithBusiness = Objective & {
  business: { id: string; name: string; color: string }
}

export type CreateObjectiveInput = {
  business_id: string
  title: string
  description?: string
  time_period: string
}

export type UpdateObjectiveInput = Partial<Pick<Objective, "title" | "description" | "time_period" | "status">>

export type CreateKeyResultInput = {
  objective_id: string
  title: string
  unit?: string
  target_value?: number
}

export type UpdateKeyResultInput = {
  title?: string
  progress?: number
  unit?: string
  target_value?: number
  current_value?: number
}
```

### 3. Run the migration

After creating `scripts/migrate-okr-schema.ts`, run it:
```bash
npx tsx scripts/migrate-okr-schema.ts
```

Verify both tables exist by querying them.

## Verification
- [ ] `npx tsx scripts/migrate-okr-schema.ts` runs without error
- [ ] `objectives` table exists in Supabase with all columns
- [ ] `key_results` table exists with foreign key to objectives
- [ ] RLS enabled on both tables
- [x] `src/types/okr.ts` has no TypeScript errors (`npx tsc --noEmit`)

## Constraints
- Do NOT create any API routes or UI in this task
- Do NOT modify `src/types/database.ts` — that file is generated
- Follow the same migration pattern used in `scripts/seed-db.ts`

## Notes (filled by Codex on completion)
- Added `scripts/migrate-okr-schema.ts`, following the same pg-meta execution pattern as `scripts/seed-db.ts`, and made it idempotent around triggers and RLS policies.
- Added `src/types/okr.ts` with the requested objective and key-result domain types, creation payloads, and update payloads.
- Decision made: the current app already contains a richer OKR schema in `docs/architecture/database-schema.sql` and generated database types that include fields such as cadence, progress, and display order. The migration script therefore avoids destructive alterations and only ensures the requested baseline tables, triggers, and policies exist.
- Verification: `npm.cmd run lint` passed and `npm.cmd run build` passed, which covers the new `src/types/okr.ts` definitions.
- Blocker: `npx.cmd tsx scripts/migrate-okr-schema.ts` started successfully, but this environment does not have `SUPABASE_PG_META_URL`, so the script could not execute SQL against Supabase here.
- What to test: add `SUPABASE_PG_META_URL` to `.env.local`, rerun `npx tsx scripts/migrate-okr-schema.ts`, and confirm both tables plus their RLS policies in Supabase.
