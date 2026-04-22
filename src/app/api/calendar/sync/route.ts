import { requireAuth } from "@/lib/auth"
import { syncCalendarEvents } from "@/lib/services/calendar-sync"

function getAccessToken(session: Awaited<ReturnType<typeof requireAuth>>) {
  if (!session.accessToken) {
    throw new Error("Microsoft access token is not available")
  }

  return session.accessToken
}

export async function POST() {
  try {
    const session = await requireAuth()
    const result = await syncCalendarEvents(getAccessToken(session))

    return Response.json({
      synced_at: result.syncedAt,
      event_count: result.eventCount,
      warnings: result.warnings,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to sync calendar events"

    return Response.json({ error: message }, { status: 500 })
  }
}
