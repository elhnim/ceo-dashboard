import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import { syncCalendarEvents } from "@/lib/services/calendar-sync"
import { syncEmails } from "@/lib/services/email-sync"
import { getSettings } from "@/lib/services/settings"
import { syncTasks } from "@/lib/services/tasks-sync"
import { syncTeams } from "@/lib/services/teams-sync"

type ModuleName = "calendar" | "tasks" | "email" | "teams"

export interface ModuleSyncResult {
  module: ModuleName
  status: "success" | "error"
  eventCount: number | null
  errorMessage: string | null
  syncedAt: string
}

export interface SyncAllModulesResult {
  completedAt: string
  results: ModuleSyncResult[]
}

function getDashboardUserId() {
  const userId = process.env.DASHBOARD_USER_ID

  if (!userId) {
    throw new Error("Missing required environment variable: DASHBOARD_USER_ID")
  }

  return userId
}

function getEventCount(result: unknown) {
  if (typeof result === "number") {
    return result
  }

  if (
    typeof result === "object" &&
    result !== null &&
    "mentionCount" in result &&
    typeof result.mentionCount === "number" &&
    "channelItemCount" in result &&
    typeof result.channelItemCount === "number"
  ) {
    return result.mentionCount + result.channelItemCount
  }

  return 0
}

export async function syncAllModules(
  accessToken: string
): Promise<SyncAllModulesResult> {
  const supabase = createAdminClient()
  const settings = await getSettings(getDashboardUserId(), { useAdminClient: true })
  const modules = [
    {
      name: "calendar" as const,
      fn: () => syncCalendarEvents(accessToken),
    },
    {
      name: "tasks" as const,
      fn: () => syncTasks(accessToken),
    },
    {
      name: "email" as const,
      fn: () => syncEmails(accessToken),
    },
    {
      name: "teams" as const,
      fn: () =>
        syncTeams(
          accessToken,
          settings.teamsConfig.monitoredChannels,
          settings.teamsConfig.lookbackHours
        ),
    },
  ]

  const settled = await Promise.allSettled(
    modules.map(async (module): Promise<ModuleSyncResult> => {
      const syncedAt = new Date().toISOString()

      try {
        const rawResult = await module.fn()
        const eventCount = getEventCount(rawResult)
        await supabase.from("module_sync_log").insert({
          module: module.name,
          status: "success",
          synced_at: syncedAt,
          event_count: eventCount,
        })

        return {
          module: module.name,
          status: "success",
          eventCount,
          errorMessage: null,
          syncedAt,
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown sync failure"

        await supabase.from("module_sync_log").insert({
          module: module.name,
          status: "error",
          error_message: errorMessage,
          synced_at: syncedAt,
        })

        return {
          module: module.name,
          status: "error",
          eventCount: null,
          errorMessage,
          syncedAt,
        }
      }
    })
  )

  return {
    completedAt: new Date().toISOString(),
    results: settled.map((entry, index) =>
      entry.status === "fulfilled"
        ? entry.value
        : {
            module: modules[index].name,
            status: "error",
            eventCount: null,
            errorMessage:
              entry.reason instanceof Error
                ? entry.reason.message
                : "Unknown sync failure",
            syncedAt: new Date().toISOString(),
          }
    ),
  }
}
