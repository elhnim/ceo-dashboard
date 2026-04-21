import type { Session } from "next-auth"

import { requireAuth } from "@/lib/auth"
import { getSettings, SettingsSchemaError } from "@/lib/services/settings"
import { syncTeams } from "@/lib/services/teams-sync"

function getSessionUserId(session: Session | null) {
  const userId = session?.user?.email?.trim()

  if (!userId) {
    throw new Error("A session email is required to load Teams settings.")
  }

  return userId
}

export async function POST() {
  try {
    const session = await requireAuth()

    if (!session.accessToken) {
      return Response.json(
        { error: "Microsoft access token is not available for this session." },
        { status: 400 }
      )
    }

    let monitoredChannels: string[] = []
    let lookbackHours = 24

    try {
      const settings = await getSettings(getSessionUserId(session))
      monitoredChannels = settings.teamsConfig.monitoredChannels
      lookbackHours = settings.teamsConfig.lookbackHours
    } catch (error) {
      if (error instanceof SettingsSchemaError) {
        console.error(`Teams sync settings fallback: ${error.message}`)
      } else {
        throw error
      }
    }

    const result = await syncTeams(
      session.accessToken,
      monitoredChannels,
      lookbackHours
    )

    return Response.json({ synced: true, ...result })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to sync Teams activity"

    return Response.json({ error: message }, { status: 500 })
  }
}
