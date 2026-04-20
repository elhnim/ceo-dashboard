-- CEO Dashboard — Supabase Database Schema
-- Phase 0-1: Businesses + Vision/Mission/Values + OKRs
-- Run this in Supabase SQL Editor

-- ============================================
-- BUSINESSES
-- ============================================

create table businesses (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  color text default '#6366f1',
  logo_url text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- VISION / MISSION / VALUES (with versioning)
-- ============================================

-- Current VMV per business (latest version)
create table business_vmv (
  id uuid default gen_random_uuid() primary key,
  business_id uuid not null references businesses(id) on delete cascade,
  vision text,
  mission text,
  values text,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(business_id)
);

-- VMV version history (append-only log)
create table business_vmv_history (
  id uuid default gen_random_uuid() primary key,
  business_id uuid not null references businesses(id) on delete cascade,
  vision text,
  mission text,
  values text,
  version integer not null,
  change_note text,
  created_at timestamptz not null default now()
);

-- Trigger: auto-archive VMV changes to history
create or replace function archive_vmv_version()
returns trigger as $$
begin
  insert into business_vmv_history (
    business_id, vision, mission, values, version, change_note
  ) values (
    OLD.business_id, OLD.vision, OLD.mission, OLD.values, OLD.version, 'Auto-archived on update'
  );
  NEW.version = OLD.version + 1;
  NEW.updated_at = now();
  return NEW;
end;
$$ language plpgsql;

create trigger vmv_version_trigger
  before update on business_vmv
  for each row
  execute function archive_vmv_version();

-- ============================================
-- OKRs
-- ============================================

create type okr_status as enum ('draft', 'active', 'completed', 'cancelled');
create type okr_cadence as enum ('annual', 'quarterly', 'monthly');

create table objectives (
  id uuid default gen_random_uuid() primary key,
  business_id uuid not null references businesses(id) on delete cascade,
  title text not null,
  description text,
  status okr_status not null default 'draft',
  cadence okr_cadence not null default 'quarterly',
  start_date date,
  end_date date,
  progress numeric(5,2) not null default 0,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table key_results (
  id uuid default gen_random_uuid() primary key,
  objective_id uuid not null references objectives(id) on delete cascade,
  title text not null,
  description text,
  target_value numeric not null default 100,
  current_value numeric not null default 0,
  unit text default '%',
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-calculate objective progress from key results
create or replace function update_objective_progress()
returns trigger as $$
begin
  update objectives
  set progress = (
    select coalesce(
      avg(
        case
          when kr.target_value = 0 then 0
          else least((kr.current_value / kr.target_value) * 100, 100)
        end
      ), 0
    )
    from key_results kr
    where kr.objective_id = coalesce(NEW.objective_id, OLD.objective_id)
  ),
  updated_at = now()
  where id = coalesce(NEW.objective_id, OLD.objective_id);
  return NEW;
end;
$$ language plpgsql;

create trigger kr_progress_trigger
  after insert or update or delete on key_results
  for each row
  execute function update_objective_progress();

-- ============================================
-- DAILY RITUALS
-- ============================================

create table daily_priorities (
  id uuid default gen_random_uuid() primary key,
  date date not null default current_date,
  priority_1 text,
  priority_2 text,
  priority_3 text,
  do_this_next text,
  completed_items jsonb default '[]',
  reflection text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(date)
);

-- ============================================
-- INDEXES
-- ============================================

create index idx_businesses_active on businesses(is_active) where is_active = true;
create index idx_businesses_order on businesses(display_order);
create index idx_vmv_business on business_vmv(business_id);
create index idx_vmv_history_business on business_vmv_history(business_id, version desc);
create index idx_objectives_business on objectives(business_id);
create index idx_objectives_status on objectives(status) where status = 'active';
create index idx_key_results_objective on key_results(objective_id);
create index idx_daily_priorities_date on daily_priorities(date desc);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
-- Single user app, but good practice to have RLS enabled

alter table businesses enable row level security;
alter table business_vmv enable row level security;
alter table business_vmv_history enable row level security;
alter table objectives enable row level security;
alter table key_results enable row level security;
alter table daily_priorities enable row level security;

-- Allow all operations for authenticated users (single user app)
create policy "Allow all for authenticated" on businesses for all using (true);
create policy "Allow all for authenticated" on business_vmv for all using (true);
create policy "Allow all for authenticated" on business_vmv_history for all using (true);
create policy "Allow all for authenticated" on objectives for all using (true);
create policy "Allow all for authenticated" on key_results for all using (true);
create policy "Allow all for authenticated" on daily_priorities for all using (true);

-- ============================================
-- UPDATED_AT TRIGGER (reusable)
-- ============================================

create or replace function update_updated_at()
returns trigger as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$ language plpgsql;

create trigger businesses_updated_at before update on businesses
  for each row execute function update_updated_at();

create trigger objectives_updated_at before update on objectives
  for each row execute function update_updated_at();

create trigger key_results_updated_at before update on key_results
  for each row execute function update_updated_at();

create trigger daily_priorities_updated_at before update on daily_priorities
  for each row execute function update_updated_at();
