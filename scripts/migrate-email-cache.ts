import { createAdminClient } from "@/lib/supabase/admin"

const emailCacheSchemaSql = `
create extension if not exists pgcrypto;

create table if not exists emails_cache (
  id uuid default gen_random_uuid() primary key,
  external_id text not null unique,
  subject text not null,
  sender text not null,
  sender_email text not null,
  received_at timestamptz not null,
  is_urgent boolean not null default false,
  is_flagged boolean not null default false,
  body_preview text,
  action_taken text check (action_taken in ('reply_later', 'delegate', 'archive', 'done', null)),
  synced_at timestamptz not null default now()
);

create index if not exists idx_emails_cache_received on emails_cache(received_at desc);
create index if not exists idx_emails_cache_urgent on emails_cache(is_urgent) where is_urgent = true;

alter table emails_cache enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'emails_cache'
      and policyname = 'Allow all for authenticated'
  ) then
    create policy "Allow all for authenticated"
      on emails_cache
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
  const { error } = await supabase.from("emails_cache").select("external_id").limit(1)

  if (error) {
    throw new Error(`Email cache verification failed: ${error.message}`)
  }
}

async function main() {
  await runSql(emailCacheSchemaSql)
  await verifyTable()
  console.log("Email cache migration completed successfully.")
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(message)
  process.exitCode = 1
})
