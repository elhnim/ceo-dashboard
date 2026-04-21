export type TeamsCacheType = "mention" | "channel"

export interface TeamsCacheRecord {
  id: string
  type: TeamsCacheType
  channelId: string | null
  channelName: string | null
  teamName: string | null
  summary: string
  actionRequired: boolean
  receivedAt: string
  syncedAt: string
}

export interface TeamsChannelGroup {
  channelId: string | null
  channelName: string
  teamName: string | null
  issues: string[]
  decisions: string[]
}

export interface TeamsActivity {
  mentions: TeamsCacheRecord[]
  channels: TeamsChannelGroup[]
}
