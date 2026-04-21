import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import { encodeChannelSummary } from "@/lib/services/teams"
import { MicrosoftTeamsProvider } from "@/lib/services/teams-microsoft"

export interface TeamsSyncResult {
  mentionCount: number
  channelItemCount: number
}

export async function syncTeams(
  accessToken: string,
  monitoredChannels: string[],
  lookbackHours = 24,
): Promise<TeamsSyncResult> {
  const supabase = createAdminClient()
  const since = new Date(Date.now() - lookbackHours * 60 * 60 * 1000)
  const provider = new MicrosoftTeamsProvider(accessToken)

  const [mentions, channelSummaries] = await Promise.all([
    provider.getMentions(since),
    provider.getChannelSummaries(monitoredChannels, since),
  ])

  const { error: deleteError } = await supabase
    .from("teams_cache")
    .delete()
    .gte("synced_at", new Date(0).toISOString())

  if (deleteError) {
    throw new Error(deleteError.message)
  }

  const syncedAt = new Date().toISOString()
  const mentionRows = mentions.map((mention) => ({
    type: "mention" as const,
    channel_id: mention.channelName,
    channel_name: mention.channelName,
    team_name: null,
    summary: mention.messagePreview,
    action_required: mention.actionRequired,
    received_at: mention.receivedAt,
    synced_at: syncedAt,
  }))

  const channelRows = channelSummaries.flatMap((summary) => [
    ...summary.issues.map((issue: string) => ({
      type: "channel" as const,
      channel_id: summary.channelId,
      channel_name: summary.channelName,
      team_name: summary.teamName ?? null,
      summary: encodeChannelSummary("issue", issue),
      action_required: false,
      received_at: syncedAt,
      synced_at: syncedAt,
    })),
    ...summary.decisions.map((decision: string) => ({
      type: "channel" as const,
      channel_id: summary.channelId,
      channel_name: summary.channelName,
      team_name: summary.teamName ?? null,
      summary: encodeChannelSummary("decision", decision),
      action_required: false,
      received_at: syncedAt,
      synced_at: syncedAt,
    })),
  ])

  const rows = [...mentionRows, ...channelRows]

  if (rows.length > 0) {
    const { error: insertError } = await supabase.from("teams_cache").insert(rows)

    if (insertError) {
      throw new Error(insertError.message)
    }
  }

  return {
    mentionCount: mentionRows.length,
    channelItemCount: channelRows.length,
  }
}
