import { createAdminClient } from "@/lib/supabase/admin"

const okrSchemaSql = `
create extension if not exists pgcrypto;

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists objectives (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  title text not null,
  description text,
  time_period text not null,
  status text not null default 'active' check (status in ('active', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists key_results (
  id uuid primary key default gen_random_uuid(),
  objective_id uuid not null references objectives(id) on delete cascade,
  title text not null,
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  unit text,
  target_value numeric,
  current_value numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists objectives_updated_at on objectives;
create trigger objectives_updated_at
  before update on objectives
  for each row execute function update_updated_at();

drop trigger if exists key_results_updated_at on key_results;
create trigger key_results_updated_at
  before update on key_results
  for each row execute function update_updated_at();

alter table objectives enable row level security;
alter table key_results enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'objectives'
      and policyname = 'Allow all for authenticated'
  ) then
    create policy "Allow all for authenticated"
      on objectives
      for all
      using (true);
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'key_results'
      and policyname = 'Allow all for authenticated'
  ) then
    create policy "Allow all for authenticated"
      on key_results
      for all
      using (true);
  end if;
end;
$$;
`

function getRequiredEnv(name: "SUPABASE_PG_META_URL") {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

async function runSql(query: string) {
  const response = await fetch(`${getRequiredEnv("SUPABASE_PG_META_URL")}/query`, {
    method: "POST",
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || ""}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Supabase query failed (${response.status}): ${errorText}`)
  }
}

async function verifyTables() {
  const supabase = createAdminClient()
  const [objectivesResult, keyResultsResult] = await Promise.all([
    supabase.from("objectives").select("id").limit(1),
    supabase.from("key_results").select("id").limit(1),
  ])

  if (objectivesResult.error) {
    throw new Error(`Objectives verification failed: ${objectivesResult.error.message}`)
  }

  if (keyResultsResult.error) {
    throw new Error(`Key results verification failed: ${keyResultsResult.error.message}`)
  }
}

async function main() {
  await runSql(okrSchemaSql)
  await verifyTables()
  console.log("OKR schema migration completed successfully.")
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(message)
  process.exitCode = 1
})
