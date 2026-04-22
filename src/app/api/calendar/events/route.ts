import { requireAuth } from "@/lib/auth"
import {
  CalendarSchemaError,
  getWeekRange,
  listCalendarEvents,
} from "@/lib/services/calendar"
import { syncCalendarEvents } from "@/lib/services/calendar-sync"

function parseDate(value: string | null, fallback: Date) {
  if (!value) {
    return fallback
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? fallback : date
}

function getAccessToken(session: Awaited<ReturnType<typeof requireAuth>>) {
  if (!session.accessToken) {
    throw new Error("Microsoft access token is not available")
  }

  return session.accessToken
}

export async function GET(request: Request) {
  try {
    await requireAuth()

    const { searchParams } = new URL(request.url)
    const weekRange = getWeekRange()
    const from = parseDate(searchParams.get("from"), weekRange.start)
    const to = parseDate(searchParams.get("to"), weekRange.end)
    const events = await listCalendarEvents(from, to)

    return Response.json({ events })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load calendar events"
    const status = error instanceof CalendarSchemaError ? 503 : 500

    return Response.json({ events: [], error: message }, { status })
  }
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
