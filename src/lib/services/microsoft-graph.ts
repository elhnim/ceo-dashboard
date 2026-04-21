import "server-only"

import { Client, GraphError } from "@microsoft/microsoft-graph-client"
import type { Event as GraphEvent } from "@microsoft/microsoft-graph-types"
import type { Channel, Team } from "@microsoft/microsoft-graph-types"

type GraphTeamsResponse = {
  value?: Team[]
}

type GraphChannelsResponse = {
  value?: Channel[]
}

export type TeamsChannel = {
  teamId: string
  teamName: string
  channelId: string
  channelName: string
}

export class MicrosoftGraphError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "MicrosoftGraphError"
    this.status = status
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

export async function archiveEmail(accessToken: string, emailId: string) {
  try {
    await getGraphClient(accessToken).api(`/me/messages/${emailId}/move`).post({
      destinationId: "archive",
    })
  } catch (error) {
    throw toMicrosoftGraphError(error)
  }
}

export async function markAsRead(accessToken: string, emailId: string) {
  try {
    await getGraphClient(accessToken).api(`/me/messages/${emailId}`).patch({
      isRead: true,
    })
  } catch (error) {
    throw toMicrosoftGraphError(error)
  }
}

export async function flagEmail(accessToken: string, emailId: string) {
  try {
    await getGraphClient(accessToken).api(`/me/messages/${emailId}`).patch({
      flag: { flagStatus: "flagged" },
    })
  } catch (error) {
    throw toMicrosoftGraphError(error)
  }
}

interface GraphCalendarResponse {
  value?: GraphEvent[]
}

export async function getCalendarViewEvents(
  accessToken: string,
  from: Date,
  to: Date
): Promise<GraphEvent[]> {
  try {
    const response = (await getGraphClient(accessToken)
      .api("/me/calendarView")
      .query({
        startDateTime: from.toISOString(),
        endDateTime: to.toISOString(),
      })
      .select("id,subject,start,end,attendees,location,isAllDay")
      .orderby("start/dateTime")
      .top(250)
      .get()) as GraphCalendarResponse

    return response.value ?? []
  } catch (error) {
    throw toMicrosoftGraphError(error)
  }
}

export async function getJoinedTeamChannels(
  accessToken: string
): Promise<TeamsChannel[]> {
  try {
    const client = getGraphClient(accessToken)
    const teamsResponse = (await client
      .api("/me/joinedTeams")
      .select(["id", "displayName"])
      .top(100)
      .get()) as GraphTeamsResponse

    const channelsByTeam = await Promise.all(
      (teamsResponse.value ?? []).map(async (team) => {
        if (!team.id) {
          return []
        }

        const channelsResponse = (await client
          .api(`/teams/${team.id}/channels`)
          .select(["id", "displayName"])
          .top(200)
          .get()) as GraphChannelsResponse

        return (channelsResponse.value ?? [])
          .filter((channel): channel is Channel & { id: string } => Boolean(channel.id))
          .map((channel) => ({
            teamId: team.id as string,
            teamName: team.displayName?.trim() || "Untitled team",
            channelId: channel.id,
            channelName: channel.displayName?.trim() || "Untitled channel",
          }))
      })
    )

    return channelsByTeam.flat()
  } catch (error) {
    throw toMicrosoftGraphError(error)
  }
}
