import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { AppSettings } from "@/types/settings"

type SettingsConfig = Omit<AppSettings, "id" | "userId">

type JsonObject = Record<string, unknown>

interface SettingsRow {
  id: string
  user_id: string
  calendar_config: AppSettings["calendarConfig"]
  tasks_config: AppSettings["tasksConfig"]
  email_config: AppSettings["emailConfig"]
  teams_config: AppSettings["teamsConfig"]
  okrs_config: AppSettings["okrsConfig"]
  briefing_config: AppSettings["briefingConfig"]
  notifications_config: AppSettings["notificationsConfig"]
  rituals_config: AppSettings["ritualsConfig"]
  weekly_review_config: AppSettings["weeklyReviewConfig"]
}

export class SettingsSchemaError extends Error {
  constructor(message = "Supabase can’t read the settings table for the dashboard yet.") {
    super(message)
    this.name = "SettingsSchemaError"
  }
}

const DEFAULT_SETTINGS_CONFIG: SettingsConfig = {
  calendarConfig: {
    accounts: [],
    includeInBrief: true,
  },
  tasksConfig: {
    doThisNextAlgorithm: "importance_then_due_date",
    includeInBrief: true,
  },
  emailConfig: {
    lookbackHours: 24,
    urgentKeywords: [],
    includeInBrief: true,
  },
  teamsConfig: {
    monitoredChannels: [],
    lookbackHours: 24,
    includeInBrief: true,
  },
  okrsConfig: {
    cadence: "quarterly",
    progressMethod: "manual_percentage",
    includeInBrief: true,
  },
  briefingConfig: {
    scheduleTime: "06:30",
    timezone: "Australia/Melbourne",
    secondRunTime: null,
    model: "claude-sonnet-4-6",
    sections: {
      focus: { enabled: true, format: "narrative" },
      calendar: { enabled: true, format: "structured" },
      tasks: { enabled: true, format: "structured" },
      email: { enabled: true, format: "structured" },
      teams: { enabled: true, format: "structured" },
      okrs: { enabled: true, format: "structured" },
    },
  },
  notificationsConfig: {
    calendar: true,
    tasks: true,
    email: true,
    okrs: true,
    batchTimes: ["08:00", "12:00", "17:00"],
  },
  ritualsConfig: {
    morningKickoffTime: "07:00",
    endOfDayTime: "17:30",
  },
  weeklyReviewConfig: {
    preferredDay: "friday",
    reminderEnabled: true,
  },
}

function formatSettingsError(message: string) {
  if (message.includes("schema cache")) {
    return new SettingsSchemaError(
      "Supabase can’t read the settings table yet. Re-run the Phase 4 schema in Supabase SQL Editor or refresh the project API schema cache."
    )
  }

  return new Error(message)
}

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function mergeJson<T>(current: T, patch: Partial<T> | undefined): T {
  if (patch === undefined) {
    return current
  }

  if (Array.isArray(current) || Array.isArray(patch)) {
    return patch as T
  }

  if (!isJsonObject(current) || !isJsonObject(patch)) {
    return patch as T
  }

  const merged: JsonObject = { ...current }

  for (const [key, value] of Object.entries(patch)) {
    const currentValue = merged[key]

    if (value === undefined) {
      continue
    }

    if (isJsonObject(currentValue) && isJsonObject(value)) {
      merged[key] = mergeJson(currentValue, value)
      continue
    }

    merged[key] = value
  }

  return merged as T
}

function toAppSettings(row: SettingsRow): AppSettings {
  return {
    id: row.id,
    userId: row.user_id,
    calendarConfig: mergeJson(
      DEFAULT_SETTINGS_CONFIG.calendarConfig,
      row.calendar_config
    ),
    tasksConfig: mergeJson(DEFAULT_SETTINGS_CONFIG.tasksConfig, row.tasks_config),
    emailConfig: mergeJson(DEFAULT_SETTINGS_CONFIG.emailConfig, row.email_config),
    teamsConfig: mergeJson(DEFAULT_SETTINGS_CONFIG.teamsConfig, row.teams_config),
    okrsConfig: mergeJson(DEFAULT_SETTINGS_CONFIG.okrsConfig, row.okrs_config),
    briefingConfig: mergeJson(
      DEFAULT_SETTINGS_CONFIG.briefingConfig,
      row.briefing_config
    ),
    notificationsConfig: mergeJson(
      DEFAULT_SETTINGS_CONFIG.notificationsConfig,
      row.notifications_config
    ),
    ritualsConfig: mergeJson(
      DEFAULT_SETTINGS_CONFIG.ritualsConfig,
      row.rituals_config
    ),
    weeklyReviewConfig: mergeJson(
      DEFAULT_SETTINGS_CONFIG.weeklyReviewConfig,
      row.weekly_review_config
    ),
  }
}

async function findSettingsRow(userId: string): Promise<SettingsRow | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("settings")
    .select(
      "id, user_id, calendar_config, tasks_config, email_config, teams_config, okrs_config, briefing_config, notifications_config, rituals_config, weekly_review_config"
    )
    .eq("user_id", userId)
    .maybeSingle()

  if (error) {
    throw formatSettingsError(error.message)
  }

  return data as SettingsRow | null
}

async function insertDefaultSettings(userId: string): Promise<SettingsRow> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("settings")
    .insert({ user_id: userId })
    .select(
      "id, user_id, calendar_config, tasks_config, email_config, teams_config, okrs_config, briefing_config, notifications_config, rituals_config, weekly_review_config"
    )
    .single()

  if (error) {
    throw formatSettingsError(error.message)
  }

  return data as SettingsRow
}

export async function getSettings(userId: string): Promise<AppSettings> {
  const existingSettings = await findSettingsRow(userId)

  if (existingSettings) {
    return toAppSettings(existingSettings)
  }

  const createdSettings = await insertDefaultSettings(userId)
  return toAppSettings(createdSettings)
}

export async function updateSettings(
  userId: string,
  patch: Partial<AppSettings>
): Promise<AppSettings> {
  const currentSettings = await getSettings(userId)

  if (patch.userId && patch.userId !== userId) {
    throw new Error("Settings user ID cannot be changed")
  }

  const payload = {
    calendar_config: mergeJson(
      currentSettings.calendarConfig,
      patch.calendarConfig
    ),
    tasks_config: mergeJson(currentSettings.tasksConfig, patch.tasksConfig),
    email_config: mergeJson(currentSettings.emailConfig, patch.emailConfig),
    teams_config: mergeJson(currentSettings.teamsConfig, patch.teamsConfig),
    okrs_config: mergeJson(currentSettings.okrsConfig, patch.okrsConfig),
    briefing_config: mergeJson(
      currentSettings.briefingConfig,
      patch.briefingConfig
    ),
    notifications_config: mergeJson(
      currentSettings.notificationsConfig,
      patch.notificationsConfig
    ),
    rituals_config: mergeJson(currentSettings.ritualsConfig, patch.ritualsConfig),
    weekly_review_config: mergeJson(
      currentSettings.weeklyReviewConfig,
      patch.weeklyReviewConfig
    ),
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("settings")
    .update(payload)
    .eq("user_id", userId)
    .select(
      "id, user_id, calendar_config, tasks_config, email_config, teams_config, okrs_config, briefing_config, notifications_config, rituals_config, weekly_review_config"
    )
    .single()

  if (error) {
    throw formatSettingsError(error.message)
  }

  return toAppSettings(data as SettingsRow)
}
