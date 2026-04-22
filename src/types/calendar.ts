import type { CalendarProviderName, CalendarType } from "@/types/integrations"

export interface CalendarEventRecord {
  id: string
  provider: CalendarProviderName
  externalId: string
  title: string
  startAt: string
  endAt: string
  attendees: string[]
  location: string | null
  calendarType: CalendarType
  isAllDay: boolean
  syncedAt: string
}

export interface CalendarEventsResponse {
  events: CalendarEventRecord[]
  error?: string
}

export interface CalendarSyncResponse {
  synced_at: string
  event_count: number
  warnings: string[]
  error?: string
}
