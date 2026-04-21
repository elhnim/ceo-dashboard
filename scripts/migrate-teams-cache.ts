import { createAdminClient } from "@/lib/supabase/admin"

const teamsCacheSchemaSql = `
create extension if not exists pgcrypto;

create table if not exists teams_cache (
  id uuid default gen_random_uuid() primary key,
  type text not null check (type in ('mention', 'channel')),
  channel_id text,
  channel_name text,
  team_name text,
  summary text not null,
  action_required boolean not null default false,
  received_at timestamptz not null,
  synced_at timestamptz not null default now()
);

create index if not exists idx_teams_cache_type on teams_cache(type);
create index if not exists idx_teams_cache_received on teams_cache(received_at desc);

alter table teams_cache enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'teams_cache'
      and policyname = 'Allow all for authenticated'
  ) then
    create policy "Allow all for authenticated"
      on teams_cache
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
  const { error } = await supabase.from("teams_cache").select("id").limit(1)

  if (error) {
    throw new Error(`Teams cache verification failed: ${error.message}`)
  }
}

async function main() {
  await runSql(teamsCacheSchemaSql)
  await verifyTable()
  console.log("Teams cache migration completed successfully.")
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(message)
  process.exitCode = 1
})
