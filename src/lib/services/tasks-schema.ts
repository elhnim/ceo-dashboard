import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"

const tasksSchemaSql = `
create extension if not exists pgcrypto;

create table if not exists tasks_cache (
  id uuid default gen_random_uuid() primary key,
  external_id text not null unique,
  title text not null,
  due_date date,
  importance text not null default 'normal' check (importance in ('low', 'normal', 'high')),
  status text not null default 'notStarted' check (status in ('notStarted', 'inProgress', 'completed')),
  body_preview text,
  quadrant text check (quadrant in ('do', 'schedule', 'delegate', 'eliminate')),
  synced_at timestamptz not null default now()
);

create index if not exists idx_tasks_cache_status on tasks_cache(status) where status != 'completed';

alter table tasks_cache enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'tasks_cache'
      and policyname = 'Allow all for authenticated'
  ) then
    create policy "Allow all for authenticated"
      on tasks_cache
      for all
      using (true);
  end if;
end;
$$;
`

export class TaskSchemaError extends Error {
  constructor(message = "Supabase can’t read the tasks cache table yet.") {
    super(message)
    this.name = "TaskSchemaError"
  }
}

function getPgMetaUrl() {
  return process.env.SUPABASE_PG_META_URL ?? null
}

async function applySchemaWithPgMeta(query: string) {
  const pgMetaUrl = getPgMetaUrl()

  if (!pgMetaUrl) {
    throw new TaskSchemaError(
      "tasks_cache is missing in Supabase. Set SUPABASE_PG_META_URL so Codex can create it automatically, or run the tasks schema manually in Supabase SQL Editor.",
    )
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceRoleKey) {
    throw new TaskSchemaError(
      "SUPABASE_SERVICE_ROLE_KEY is required to create the tasks cache schema.",
    )
  }

  const response = await fetch(`${pgMetaUrl}/query`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new TaskSchemaError(
      `Unable to create tasks_cache automatically: ${errorText}`,
    )
  }
}

function shouldBootstrapSchema(message: string) {
  return (
    message.includes("tasks_cache") &&
    (message.includes("does not exist") || message.includes("schema cache"))
  )
}

export async function ensureTasksSchema() {
  const supabase = createAdminClient()
  const { error } = await supabase.from("tasks_cache").select("id").limit(1)

  if (!error) {
    return
  }

  if (!shouldBootstrapSchema(error.message)) {
    throw new Error(error.message)
  }

  await applySchemaWithPgMeta(tasksSchemaSql)

  const verification = await supabase.from("tasks_cache").select("id").limit(1)

  if (verification.error) {
    throw new TaskSchemaError(
      `tasks_cache still isn’t available after bootstrap: ${verification.error.message}`,
    )
  }
}

export function getTasksSchemaSql() {
  return tasksSchemaSql
}
