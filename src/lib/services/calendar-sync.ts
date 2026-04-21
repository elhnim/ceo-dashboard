import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import { ICloudCalendarProvider } from "@/lib/services/calendar-icloud"
import { getSettings } from "@/lib/services/settings"
import type { CalendarProviderName, CalendarType } from "@/types/integrations"

import { OutlookCalendarProvider } from "./calendar-outlook"

function startOfWeek(date: Date): Date {
  const result = new Date(date)
  const day = result.getDay()
  const diff = day === 0 ? -6 : 1 - day
  result.setDate(result.getDate() + diff)
  result.setHours(0, 0, 0, 0)
  return result
}

function endOfWeek(date: Date): Date {
  const result = startOfWeek(date)
  result.setDate(result.getDate() + 6)
  result.setHours(23, 59, 59, 999)
  return result
}

interface CalendarAccountConfig {
  enabled: boolean
  calendarType: CalendarType
}

export interface CalendarSyncResult {
  syncedAt: string
  eventCount: number
  warnings: string[]
}

function getDefaultAccountConfig(): Record<CalendarProviderName, CalendarAccountConfig> {
  return {
    outlook: { enabled: true, calendarType: "work" },
    icloud: { enabled: true, calendarType: "work" },
  }
}

async function getAccountConfig(userId: string | undefined) {
  const defaults = getDefaultAccountConfig()

  if (!userId) {
    return defaults
  }

  try {
    const settings = await getSettings(userId)

    for (const account of settings.calendarConfig.accounts) {
      defaults[account.provider] = {
        enabled: account.enabled,
        calendarType: account.calendarType,
      }
    }
  } catch {}

  return defaults
}

export async function syncCalendarEvents(
  accessToken: string,
  userId?: string
): Promise<CalendarSyncResult> {
  const supabase = createAdminClient()
  const weekStart = startOfWeek(new Date())
  const weekEnd = endOfWeek(new Date())
  const accountConfig = await getAccountConfig(userId)
  const providers = [
    accountConfig.outlook.enabled
      ? new OutlookCalendarProvider(accessToken, accountConfig.outlook.calendarType)
      : null,
    accountConfig.icloud.enabled
      ? new ICloudCalendarProvider(accountConfig.icloud.calendarType)
      : null,
  ].filter(
    (
      provider
    ): provider is OutlookCalendarProvider | ICloudCalendarProvider => provider !== null
  )
  const results = await Promise.allSettled(
    providers.map((provider) => provider.getEvents(weekStart, weekEnd))
  )
  const events = results.flatMap((result) =>
    result.status === "fulfilled" ? result.value : []
  )
  const warnings = results.flatMap((result) =>
    result.status === "rejected"
      ? [result.reason instanceof Error ? result.reason.message : "Calendar sync failed."]
      : []
  )
  const syncedAt = new Date().toISOString()

  const { error: purgeError } = await supabase
    .from("calendar_events")
    .delete()
    .lt("end_at", weekStart.toISOString())

  if (purgeError) {
    throw new Error(purgeError.message)
  }

  if (events.length === 0 && warnings.length) {
    throw new Error(warnings.join(" "))
  }

  if (events.length > 0) {
    const { error } = await supabase.from("calendar_events").upsert(
      events.map((event) => ({
        provider: event.provider,
        external_id: event.id,
        title: event.title,
        start_at: event.startAt.toISOString(),
        end_at: event.endAt.toISOString(),
        attendees: event.attendees,
        location: event.location,
        calendar_type: event.calendarType,
        is_all_day: event.isAllDay,
        synced_at: syncedAt,
      })),
      { onConflict: "provider,external_id" }
    )

    if (error) {
      throw new Error(error.message)
    }
  }

  return {
    syncedAt,
    eventCount: events.length,
    warnings,
  }
}
