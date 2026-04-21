import "server-only"

import { Client, GraphError } from "@microsoft/microsoft-graph-client"
import type { Message } from "@microsoft/microsoft-graph-types"

import { auth } from "@/lib/auth-config"
import type { Email } from "@/types/email"

type GraphMessagesResponse = {
  value?: Message[]
}

export class MicrosoftGraphError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "MicrosoftGraphError"
    this.status = status
  }
}

function normalizeEmail(message: Message): Email {
  return {
    id: message.id ?? "",
    externalId: message.id ?? "",
    subject: message.subject?.trim() || "(No subject)",
    sender: message.from?.emailAddress?.name?.trim() || "Unknown sender",
    senderEmail: message.from?.emailAddress?.address?.trim() || "",
    receivedAt: message.receivedDateTime || new Date(0).toISOString(),
    isUrgent: message.importance === "high",
    isFlagged: message.flag?.flagStatus === "flagged",
    bodyPreview: message.bodyPreview?.trim() || "",
    actionTaken: null,
    syncedAt: new Date().toISOString(),
  }
}

export function toMicrosoftGraphError(error: unknown): MicrosoftGraphError {
  if (error instanceof MicrosoftGraphError) {
    return error
  }

  if (error instanceof GraphError) {
    return new MicrosoftGraphError(
      error.message || "Microsoft Graph request failed.",
      error.statusCode,
    )
  }

  const message =
    error instanceof Error ? error.message : "Microsoft Graph request failed."

  return new MicrosoftGraphError(message, 500)
}

export function getGraphClient(accessToken: string): Client {
  return Client.init({
    authProvider: (done) => {
      done(null, accessToken)
    },
  })
}

export async function getSessionToken(req: Request): Promise<string> {
  void req
  const session = await auth()

  if (!session?.accessToken) {
    throw new Error("Microsoft access token is not available")
  }

  if (session.error === "RefreshAccessTokenError") {
    throw new Error("Microsoft access token could not be refreshed")
  }

  if (
    typeof session.expiresAt === "number" &&
    Date.now() >= session.expiresAt * 1000
  ) {
    throw new Error("Microsoft access token has expired")
  }

  return session.accessToken
}

export async function getUrgentEmails(accessToken: string): Promise<Email[]> {
  try {
    const result = (await getGraphClient(accessToken)
      .api("/me/messages")
      .filter("importance eq 'high' or flag/flagStatus eq 'flagged'")
      .select([
        "id",
        "subject",
        "from",
        "receivedDateTime",
        "importance",
        "isRead",
        "flag",
        "bodyPreview",
      ])
      .orderby("receivedDateTime desc")
      .top(50)
      .get()) as GraphMessagesResponse

    return (result.value || []).map(normalizeEmail)
  } catch (error) {
    throw toMicrosoftGraphError(error)
  }
}

export async function markAsRead(accessToken: string, id: string): Promise<void> {
  try {
    await getGraphClient(accessToken).api(`/me/messages/${id}`).update({
      isRead: true,
    })
  } catch (error) {
    throw toMicrosoftGraphError(error)
  }
}

export async function archiveEmail(accessToken: string, id: string): Promise<void> {
  try {
    await getGraphClient(accessToken).api(`/me/messages/${id}/move`).post({
      destinationId: "archive",
    })
  } catch (error) {
    throw toMicrosoftGraphError(error)
  }
}

export async function flagEmail(accessToken: string, id: string): Promise<void> {
  try {
    await getGraphClient(accessToken).api(`/me/messages/${id}`).update({
      flag: {
        flagStatus: "flagged",
      },
    })
  } catch (error) {
    throw toMicrosoftGraphError(error)
  }
}

export async function createReply(
  accessToken: string,
  id: string,
): Promise<string> {
  try {
    const reply = (await getGraphClient(accessToken)
      .api(`/me/messages/${id}/createReply`)
      .post(null)) as Message

    if (!reply.id) {
      throw new MicrosoftGraphError(
        "Microsoft Graph did not return a reply draft ID.",
        502,
      )
    }

    return reply.id
  } catch (error) {
    throw toMicrosoftGraphError(error)
  }
}

interface GraphCalendarEvent {
  id?: string
  subject?: string
  start?: { dateTime?: string }
  end?: { dateTime?: string }
  attendees?: Array<{ emailAddress?: { name?: string; address?: string } }>
  location?: { displayName?: string }
  isAllDay?: boolean
  bodyPreview?: string
}

export async function getCalendarViewEvents(
  accessToken: string,
  from: Date,
  to: Date,
): Promise<GraphCalendarEvent[]> {
  try {
    const client = getGraphClient(accessToken)
    const response = await client
      .api("/me/calendarView")
      .query({
        startDateTime: from.toISOString(),
        endDateTime: to.toISOString(),
        $select:
          "id,subject,start,end,attendees,location,isAllDay,bodyPreview",
        $orderby: "start/dateTime asc",
        $top: 100,
      })
      .get()
    return response.value ?? []
  } catch (error) {
    throw toMicrosoftGraphError(error)
  }
}

export interface TeamChannel {
  teamId: string
  teamName: string
  channelId: string
  channelName: string
}

export async function getJoinedTeamChannels(
  accessToken: string,
): Promise<TeamChannel[]> {
  try {
    const client = getGraphClient(accessToken)
    const teamsResponse = await client.api("/me/joinedTeams").get()
    const teams: Array<{ id: string; displayName: string }> =
      teamsResponse.value ?? []

    const channelArrays = await Promise.all(
      teams.map(async (team) => {
        const channelsResponse = await client
          .api(`/teams/${team.id}/channels`)
          .get()
        const channels: Array<{ id: string; displayName: string }> =
          channelsResponse.value ?? []
        return channels.map((ch) => ({
          teamId: team.id,
          teamName: team.displayName,
          channelId: ch.id,
          channelName: ch.displayName,
        }))
      }),
    )

    return channelArrays.flat()
  } catch (error) {
    throw toMicrosoftGraphError(error)
  }
}
