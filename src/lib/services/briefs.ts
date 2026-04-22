import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import type { BriefSyncHealth, DailyBrief, SyncLogEntry } from "@/types/brief"

interface DailyBriefRow {
  generated_at: string
  brief_json: unknown
}

interface SyncLogRow {
  module: SyncLogEntry["module"]
  status: SyncLogEntry["status"]
  synced_at: string
  error_message: string | null
}

function isBriefSection(value: unknown): value is DailyBrief["focus"] {
  return (
    typeof value === "object" &&
    value !== null &&
    "content" in value &&
    typeof value.content === "string" &&
    "format" in value &&
    (value.format === "narrative" || value.format === "structured")
  )
}

function isDailyBrief(value: unknown): value is DailyBrief {
  if (typeof value !== "object" || value === null) {
    return false
  }

  const candidate = value as Record<string, unknown>
  const teams = candidate.teams

  if (typeof teams !== "object" || teams === null) {
    return false
  }

  const teamSections = teams as Record<string, unknown>

  return (
    isBriefSection(candidate.focus) &&
    isBriefSection(candidate.calendar) &&
    isBriefSection(candidate.tasks) &&
    isBriefSection(candidate.email) &&
    isBriefSection(teamSections.actions) &&
    isBriefSection(teamSections.channels) &&
    isBriefSection(candidate.okrs) &&
    typeof candidate.generatedAt === "string" &&
    typeof candidate.dataAsOf === "string" &&
    (candidate.triggeredBy === "scheduled" || candidate.triggeredBy === "manual")
  )
}

function formatBriefsError(message: string) {
  if (message.includes("schema cache")) {
    return new Error(
      "Supabase cannot read the Phase 4 briefing tables yet. Re-run the Phase 4 schema in Supabase SQL Editor or refresh the API schema cache."
    )
  }

  return new Error(message)
}

export async function getLatestBrief(): Promise<DailyBrief | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("daily_briefs")
    .select("generated_at, brief_json")
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    throw formatBriefsError(error.message)
  }

  if (!data) {
    return null
  }

  const row = data as DailyBriefRow

  if (!isDailyBrief(row.brief_json)) {
    throw new Error("The latest daily brief payload is not in the expected format.")
  }

  return {
    ...row.brief_json,
    generatedAt: row.brief_json.generatedAt || row.generated_at,
  }
}

export async function getBriefSyncHealth(): Promise<BriefSyncHealth> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("module_sync_log")
    .select("module, status, synced_at, error_message")
    .order("synced_at", { ascending: false })
    .limit(20)

  if (error) {
    throw formatBriefsError(error.message)
  }

  const rows = (data ?? []) as SyncLogRow[]
  const latestSyncAt = rows[0]?.synced_at ?? null
  const latestErrorRow = rows.find((row) => row.status === "error") ?? null

  return {
    hasErrors: latestErrorRow !== null,
    latestSyncAt,
    latestError: latestErrorRow
      ? {
          module: latestErrorRow.module,
          status: latestErrorRow.status,
          syncedAt: latestErrorRow.synced_at,
          errorMessage: latestErrorRow.error_message,
        }
      : null,
  }
}
