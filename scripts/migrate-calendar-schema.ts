import { createAdminClient } from "@/lib/supabase/admin"

const calendarSchemaSql = `
create extension if not exists pgcrypto;

create table if not exists calendar_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('outlook', 'icloud')),
  external_id text not null,
  title text not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  attendees jsonb default '[]',
  location text,
  calendar_type text not null default 'work' check (calendar_type in ('work', 'personal')),
  is_all_day boolean not null default false,
  synced_at timestamptz not null default now(),
  unique(provider, external_id)
);

create index if not exists idx_calendar_events_start on calendar_events(start_at);

alter table calendar_events enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'calendar_events'
      and policyname = 'Allow all for authenticated'
  ) then
    create policy "Allow all for authenticated"
      on calendar_events
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

async function verifyTable() {
  const supabase = createAdminClient()
  const result = await supabase.from("calendar_events").select("id").limit(1)

  if (result.error) {
    throw new Error(`Calendar events verification failed: ${result.error.message}`)
  }
}

async function main() {
  await runSql(calendarSchemaSql)
  await verifyTable()
  console.log("Calendar schema migration completed successfully.")
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(message)
  process.exitCode = 1
})
