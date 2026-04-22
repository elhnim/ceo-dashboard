import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { CalendarEventRecord } from "@/types/calendar"
import type { CalendarProviderName, CalendarType } from "@/types/integrations"

interface CalendarEventRow {
  id: string
  provider: CalendarProviderName
  external_id: string
  title: string
  start_at: string
  end_at: string
  attendees: unknown
  location: string | null
  calendar_type: CalendarType
  is_all_day: boolean
  synced_at: string
}

export class CalendarSchemaError extends Error {
  constructor(message = "Supabase can’t read the calendar_events table for the dashboard yet.") {
    super(message)
    this.name = "CalendarSchemaError"
  }
}

export function getWeekRange(referenceDate = new Date()) {
  const start = new Date(referenceDate)
  start.setHours(0, 0, 0, 0)

  const day = start.getDay()
  const offset = day === 0 ? -6 : 1 - day
  start.setDate(start.getDate() + offset)

  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

function formatCalendarError(message: string) {
  if (message.includes("schema cache")) {
    return new CalendarSchemaError(
      "Supabase can’t read the calendar_events table yet. Run the calendar schema migration or refresh the project API schema cache."
    )
  }

  return new Error(message)
}

function normalizeAttendees(value: unknown) {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter((attendee): attendee is string => typeof attendee === "string")
}

function toCalendarEventRecord(row: CalendarEventRow): CalendarEventRecord {
  return {
    id: row.id,
    provider: row.provider,
    externalId: row.external_id,
    title: row.title,
    startAt: row.start_at,
    endAt: row.end_at,
    attendees: normalizeAttendees(row.attendees),
    location: row.location,
    calendarType: row.calendar_type,
    isAllDay: row.is_all_day,
    syncedAt: row.synced_at,
  }
}

export async function listCalendarEvents(
  from: Date,
  to: Date
): Promise<CalendarEventRecord[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("calendar_events")
    .select(
      "id, provider, external_id, title, start_at, end_at, attendees, location, calendar_type, is_all_day, synced_at"
    )
    .gte("start_at", from.toISOString())
    .lte("start_at", to.toISOString())
    .order("start_at", { ascending: true })
    .order("end_at", { ascending: true })

  if (error) {
    throw formatCalendarError(error.message)
  }

  return (data as CalendarEventRow[]).map(toCalendarEventRecord)
}
