import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import { createServerClient } from "@/lib/supabase/server"
import type { AppSettings, BriefingConfig } from "@/types/settings"

type SettingsRow = {
  id: string
  user_id: string
  calendar_config: AppSettings["calendarConfig"]
  tasks_config: AppSettings["tasksConfig"]
  email_config: AppSettings["emailConfig"]
  teams_config: AppSettings["teamsConfig"]
  okrs_config: AppSettings["okrsConfig"]
  briefing_config: BriefingConfig
  notifications_config: AppSettings["notificationsConfig"]
  rituals_config: AppSettings["ritualsConfig"]
  weekly_review_config: AppSettings["weeklyReviewConfig"]
}

type SettingsInsert = Omit<SettingsRow, "id">

type AppSettingsPatch = Partial<Omit<AppSettings, "id" | "userId">>
type SettingsQueryOptions = {
  useAdminClient?: boolean
}

const defaultBriefingSections: BriefingConfig["sections"] = {
  focus: { enabled: true, format: "narrative" },
  calendar: { enabled: true, format: "structured" },
  tasks: { enabled: true, format: "structured" },
  email: { enabled: true, format: "structured" },
  teams: { enabled: true, format: "structured" },
  okrs: { enabled: true, format: "structured" },
}

const defaultSettingsValues = {
  calendarConfig: {
    accounts: [],
    includeInBrief: true,
  },
  tasksConfig: {
    doThisNextAlgorithm: "importance_then_due_date" as const,
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
    cadence: "quarterly" as const,
    progressMethod: "manual_percentage" as const,
    includeInBrief: true,
  },
  briefingConfig: {
    scheduleTime: "06:30",
    timezone: "Australia/Melbourne",
    secondRunTime: null,
    model: "claude-sonnet-4-6",
    sections: defaultBriefingSections,
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
    preferredDay: "friday" as const,
    reminderEnabled: true,
  },
}

export class SettingsSchemaError extends Error {
  constructor(
    message = "Supabase can’t read the settings table for the dashboard yet."
  ) {
    super(message)
    this.name = "SettingsSchemaError"
  }
}

function formatSettingsError(message: string) {
  if (message.includes("schema cache")) {
    return new SettingsSchemaError(
      "Supabase can’t read the settings table yet. Run the Phase 4 schema in Supabase SQL Editor or refresh the project API schema cache."
    )
  }

  return new Error(message)
}

function mapSettingsRow(row: SettingsRow): AppSettings {
  return {
    id: row.id,
    userId: row.user_id,
    calendarConfig: {
      ...defaultSettingsValues.calendarConfig,
      ...row.calendar_config,
    },
    tasksConfig: {
      ...defaultSettingsValues.tasksConfig,
      ...row.tasks_config,
    },
    emailConfig: {
      ...defaultSettingsValues.emailConfig,
      ...row.email_config,
    },
    teamsConfig: {
      ...defaultSettingsValues.teamsConfig,
      ...row.teams_config,
    },
    okrsConfig: {
      ...defaultSettingsValues.okrsConfig,
      ...row.okrs_config,
    },
    briefingConfig: {
      ...defaultSettingsValues.briefingConfig,
      ...row.briefing_config,
      sections: {
        ...defaultSettingsValues.briefingConfig.sections,
        ...row.briefing_config?.sections,
      },
    },
    notificationsConfig: {
      ...defaultSettingsValues.notificationsConfig,
      ...row.notifications_config,
    },
    ritualsConfig: {
      ...defaultSettingsValues.ritualsConfig,
      ...row.rituals_config,
    },
    weeklyReviewConfig: {
      ...defaultSettingsValues.weeklyReviewConfig,
      ...row.weekly_review_config,
    },
  }
}

function buildDefaultSettingsRow(userId: string): SettingsInsert {
  return {
    user_id: userId,
    calendar_config: defaultSettingsValues.calendarConfig,
    tasks_config: defaultSettingsValues.tasksConfig,
    email_config: defaultSettingsValues.emailConfig,
    teams_config: defaultSettingsValues.teamsConfig,
    okrs_config: defaultSettingsValues.okrsConfig,
    briefing_config: defaultSettingsValues.briefingConfig,
    notifications_config: defaultSettingsValues.notificationsConfig,
    rituals_config: defaultSettingsValues.ritualsConfig,
    weekly_review_config: defaultSettingsValues.weeklyReviewConfig,
  }
}

function mergeSettings(
  current: AppSettings,
  patch: AppSettingsPatch
): SettingsInsert {
  return {
    user_id: current.userId,
    calendar_config: {
      ...current.calendarConfig,
      ...patch.calendarConfig,
    },
    tasks_config: {
      ...current.tasksConfig,
      ...patch.tasksConfig,
    },
    email_config: {
      ...current.emailConfig,
      ...patch.emailConfig,
    },
    teams_config: {
      ...current.teamsConfig,
      ...patch.teamsConfig,
    },
    okrs_config: {
      ...current.okrsConfig,
      ...patch.okrsConfig,
    },
    briefing_config: {
      ...current.briefingConfig,
      ...patch.briefingConfig,
      sections: {
        ...current.briefingConfig.sections,
        ...patch.briefingConfig?.sections,
      },
    },
    notifications_config: {
      ...current.notificationsConfig,
      ...patch.notificationsConfig,
    },
    rituals_config: {
      ...current.ritualsConfig,
      ...patch.ritualsConfig,
    },
    weekly_review_config: {
      ...current.weeklyReviewConfig,
      ...patch.weeklyReviewConfig,
    },
  }
}

async function findSettingsRow(
  userId: string,
  options: SettingsQueryOptions = {}
) {
  const supabase = await getSettingsClient(options)
  const { data, error } = await supabase
    .from("settings")
    .select(
      "id,user_id,calendar_config,tasks_config,email_config,teams_config,okrs_config,briefing_config,notifications_config,rituals_config,weekly_review_config"
    )
    .eq("user_id", userId)
    .maybeSingle()

  if (error) {
    throw formatSettingsError(error.message)
  }

  return (data as SettingsRow | null) ?? null
}

async function getSettingsClient(options: SettingsQueryOptions = {}) {
  if (options.useAdminClient) {
    return createAdminClient()
  }

  return createServerClient()
}

export async function getSettings(
  userId: string,
  options: SettingsQueryOptions = {}
): Promise<AppSettings> {
  const existingSettings = await findSettingsRow(userId, options)

  if (existingSettings) {
    return mapSettingsRow(existingSettings)
  }

  const supabase = await getSettingsClient(options)
  const { data, error } = await supabase
    .from("settings")
    .insert(buildDefaultSettingsRow(userId))
    .select(
      "id,user_id,calendar_config,tasks_config,email_config,teams_config,okrs_config,briefing_config,notifications_config,rituals_config,weekly_review_config"
    )
    .single()

  if (error) {
    throw formatSettingsError(error.message)
  }

  return mapSettingsRow(data as SettingsRow)
}

export async function updateSettings(
  userId: string,
  patch: AppSettingsPatch,
  options: SettingsQueryOptions = {}
): Promise<AppSettings> {
  const currentSettings = await getSettings(userId, options)
  const supabase = await getSettingsClient(options)
  const payload = mergeSettings(currentSettings, patch)

  const { data, error } = await supabase
    .from("settings")
    .update(payload)
    .eq("user_id", userId)
    .select(
      "id,user_id,calendar_config,tasks_config,email_config,teams_config,okrs_config,briefing_config,notifications_config,rituals_config,weekly_review_config"
    )
    .single()

  if (error) {
    throw formatSettingsError(error.message)
  }

  return mapSettingsRow(data as SettingsRow)
}
