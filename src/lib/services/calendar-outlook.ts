import "server-only"

import { getCalendarViewEvents } from "@/lib/services/microsoft-graph"
import type { CalendarEvent, CalendarProvider, CalendarType } from "@/types/integrations"

export class OutlookCalendarProvider implements CalendarProvider {
  constructor(
    private readonly accessToken: string,
    private readonly calendarType: CalendarType = "work"
  ) {}

  async getEvents(from: Date, to: Date): Promise<CalendarEvent[]> {
    const events = await getCalendarViewEvents(this.accessToken, from, to)

    return events
      .filter((event) => event.id && event.start?.dateTime && event.end?.dateTime)
      .map((event) => ({
        id: event.id ?? "",
        provider: "outlook",
        title: event.subject?.trim() || "(No title)",
        startAt: new Date(event.start?.dateTime ?? new Date(0).toISOString()),
        endAt: new Date(event.end?.dateTime ?? new Date(0).toISOString()),
        attendees:
          event.attendees?.map(
            (attendee) =>
              attendee.emailAddress?.name?.trim() ||
              attendee.emailAddress?.address?.trim() ||
              "Unknown attendee"
          ) ?? [],
        location: event.location?.displayName?.trim() || null,
        calendarType: this.calendarType,
        isAllDay: event.isAllDay ?? false,
      }))
  }
}
