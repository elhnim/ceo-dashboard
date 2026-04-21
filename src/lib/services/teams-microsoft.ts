import "server-only"

import type { TeamsMention, ChannelSummary, TeamsProvider } from "@/types/integrations"
import { MicrosoftGraphError, getGraphClient } from "@/lib/services/microsoft-graph"

interface GraphCollectionResponse<T> {
  value?: T[]
}

interface GraphUser {
  id?: string | null
}

interface GraphChatMessageMention {
  mentioned?: {
    user?: {
      id?: string | null
    } | null
  } | null
}

interface GraphChatMessage {
  id?: string | null
  chatId?: string | null
  createdDateTime?: string | null
  body?: {
    content?: string | null
  } | null
  mentions?: GraphChatMessageMention[] | null
  channelIdentity?: {
    teamId?: string | null
    channelId?: string | null
  } | null
}

interface GraphTeam {
  displayName?: string | null
}

interface GraphChannel {
  displayName?: string | null
}

function stripHtml(value: string | null | undefined) {
  return (value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function inferActionRequired(message: string) {
  const normalized = message.toLowerCase()

  return (
    normalized.includes("action") ||
    normalized.includes("please") ||
    normalized.includes("asap") ||
    normalized.includes("can you")
  )
}

function isPermissionError(error: unknown) {
  return error instanceof MicrosoftGraphError && [401, 403].includes(error.status)
}

function logGraphFallback(context: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`Teams Graph sync fallback (${context}): ${message}`)
}

async function getCurrentUserId(accessToken: string) {
  const client = getGraphClient(accessToken)
  const user = (await client.api("/me").select("id").get()) as GraphUser

  if (!user.id) {
    throw new Error("Microsoft Graph did not return the current user ID.")
  }

  return user.id
}

async function getChannelMetadata(
  accessToken: string,
  teamId: string,
  channelId: string,
) {
  const client = getGraphClient(accessToken)
  const [team, channel] = await Promise.all([
    client
      .api(`/teams/${teamId}`)
      .select("displayName")
      .get()
      .catch(() => null as GraphTeam | null),
    client
      .api(`/teams/${teamId}/channels/${channelId}`)
      .select("displayName")
      .get()
      .catch(() => null as GraphChannel | null),
  ])

  return {
    teamName: team?.displayName?.trim() || null,
    channelName: channel?.displayName?.trim() || `${teamId}:${channelId}`,
  }
}

export class MicrosoftTeamsProvider implements TeamsProvider {
  constructor(private accessToken: string) {}

  async getMentions(since: Date): Promise<TeamsMention[]> {
    try {
      const [currentUserId, response] = await Promise.all([
        getCurrentUserId(this.accessToken),
        getGraphClient(this.accessToken)
          .api("/me/chats/getAllMessages")
          .filter(`createdDateTime ge ${since.toISOString()}`)
          .select("id,body,createdDateTime,mentions,channelIdentity,chatId")
          .top(50)
          .get() as Promise<GraphCollectionResponse<GraphChatMessage>>,
      ])

      return (response.value || [])
        .filter((message) =>
          (message.mentions || []).some(
            (mention) => mention.mentioned?.user?.id === currentUserId,
          ),
        )
        .map((message) => {
          const preview = stripHtml(message.body?.content).slice(0, 200)

          return {
            id: message.id || crypto.randomUUID(),
            channelName: message.channelIdentity?.channelId || null,
            chatType: message.channelIdentity?.channelId ? "channel" : "chat",
            messagePreview: preview,
            actionRequired: inferActionRequired(preview),
            receivedAt: message.createdDateTime || new Date(0).toISOString(),
          } satisfies TeamsMention
        })
    } catch (error) {
      if (isPermissionError(error)) {
        logGraphFallback("mentions", error)
        return []
      }

      throw error
    }
  }

  async getChannelSummaries(
    channelIds: string[],
    since: Date,
  ): Promise<ChannelSummary[]> {
    if (channelIds.length === 0) {
      return []
    }

    const client = getGraphClient(this.accessToken)
    const summaries: ChannelSummary[] = []

    for (const channelRef of channelIds) {
      const [teamId, channelId] = channelRef.split(":")

      if (!teamId || !channelId) {
        continue
      }

      try {
        const [metadata, response] = await Promise.all([
          getChannelMetadata(this.accessToken, teamId, channelId),
          client
            .api(`/teams/${teamId}/channels/${channelId}/messages`)
            .filter(`createdDateTime ge ${since.toISOString()}`)
            .select("id,body,createdDateTime,subject")
            .top(100)
            .get() as Promise<GraphCollectionResponse<GraphChatMessage>>,
        ])

        const messages = (response.value || [])
          .map((message) => stripHtml(message.body?.content).slice(0, 500))
          .filter(Boolean)

        summaries.push({
          channelId,
          channelName: metadata.channelName,
          teamName: metadata.teamName,
          issues: messages.filter((message) => {
            const normalized = message.toLowerCase()
            return (
              normalized.includes("issue") ||
              normalized.includes("problem") ||
              normalized.includes("blocked")
            )
          }),
          decisions: messages.filter((message) => {
            const normalized = message.toLowerCase()
            return (
              normalized.includes("decided") ||
              normalized.includes("agreed") ||
              normalized.includes("approved")
            )
          }),
          period: { from: since.toISOString(), to: new Date().toISOString() },
        })
      } catch (error) {
        if (isPermissionError(error)) {
          logGraphFallback(`channel ${channelRef}`, error)
          continue
        }

        throw error
      }
    }

    return summaries
  }
}
