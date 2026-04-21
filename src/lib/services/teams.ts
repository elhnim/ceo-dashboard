import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import type { TeamsActivity, TeamsCacheRecord, TeamsChannelGroup } from "@/types/teams"

const ISSUE_PREFIX = "Issue: "
const DECISION_PREFIX = "Decision: "

interface TeamsCacheRow {
  id: string
  type: "mention" | "channel"
  channel_id: string | null
  channel_name: string | null
  team_name: string | null
  summary: string
  action_required: boolean
  received_at: string
  synced_at: string
}

export class TeamsSchemaError extends Error {
  constructor(message = "Teams cache schema is not available in Supabase yet.") {
    super(message)
    this.name = "TeamsSchemaError"
  }
}

function formatTeamsError(message: string) {
  if (message.includes("schema cache")) {
    return new TeamsSchemaError(
      "Supabase can’t read the teams cache table yet. Run the Teams cache migration or refresh the project API schema cache.",
    )
  }

  return new Error(message)
}

function mapTeamsCacheRow(row: TeamsCacheRow): TeamsCacheRecord {
  return {
    id: row.id,
    type: row.type,
    channelId: row.channel_id,
    channelName: row.channel_name,
    teamName: row.team_name,
    summary: row.summary,
    actionRequired: row.action_required,
    receivedAt: row.received_at,
    syncedAt: row.synced_at,
  }
}

function parseTaggedSummary(summary: string) {
  if (summary.startsWith(ISSUE_PREFIX)) {
    return { kind: "issue" as const, text: summary.slice(ISSUE_PREFIX.length) }
  }

  if (summary.startsWith(DECISION_PREFIX)) {
    return {
      kind: "decision" as const,
      text: summary.slice(DECISION_PREFIX.length),
    }
  }

  return { kind: "issue" as const, text: summary }
}

export function encodeChannelSummary(kind: "issue" | "decision", summary: string) {
  return `${kind === "issue" ? ISSUE_PREFIX : DECISION_PREFIX}${summary.trim()}`
}

export async function getTeamsCacheRecords(hours = 24): Promise<TeamsCacheRecord[]> {
  const supabase = createAdminClient()
  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
  const { data, error } = await supabase
    .from("teams_cache")
    .select(
      "id, type, channel_id, channel_name, team_name, summary, action_required, received_at, synced_at",
    )
    .gte("received_at", since)
    .order("received_at", { ascending: false })

  if (error) {
    throw formatTeamsError(error.message)
  }

  return ((data as TeamsCacheRow[] | null) || []).map(mapTeamsCacheRow)
}

export async function getTeamsActivity(hours = 24): Promise<TeamsActivity> {
  const records = await getTeamsCacheRecords(hours)
  const mentions = records.filter((record) => record.type === "mention")
  const channelsById = new Map<string, TeamsChannelGroup>()

  for (const record of records) {
    if (record.type !== "channel") {
      continue
    }

    const key = `${record.teamName || ""}:${record.channelId || record.channelName || record.id}`
    const existingGroup = channelsById.get(key) || {
      channelId: record.channelId,
      channelName: record.channelName || "Monitored channel",
      teamName: record.teamName,
      issues: [],
      decisions: [],
    }
    const parsed = parseTaggedSummary(record.summary)

    if (parsed.kind === "decision") {
      existingGroup.decisions.push(parsed.text)
    } else {
      existingGroup.issues.push(parsed.text)
    }

    channelsById.set(key, existingGroup)
  }

  return {
    mentions,
    channels: Array.from(channelsById.values()).sort((left, right) =>
      left.channelName.localeCompare(right.channelName),
    ),
  }
}
