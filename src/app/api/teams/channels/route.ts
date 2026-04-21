import { requireAuth } from "@/lib/auth"
import {
  getJoinedTeamChannels,
  MicrosoftGraphError,
} from "@/lib/services/microsoft-graph"

function getAccessToken(session: Awaited<ReturnType<typeof requireAuth>>) {
  if (!session.accessToken) {
    throw new Error("Microsoft access token is not available.")
  }

  return session.accessToken
}

export async function GET() {
  try {
    const session = await requireAuth()
    const channels = await getJoinedTeamChannels(getAccessToken(session))

    return Response.json({ data: channels, error: null })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to load Microsoft Teams channels."
    const status =
      error instanceof MicrosoftGraphError ? error.status : 500

    return Response.json({ data: [], error: message }, { status })
  }
}
