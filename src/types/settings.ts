export interface BriefingSection {
  enabled: boolean
  format: "narrative" | "structured"
}

export interface BriefingConfig {
  scheduleTime: string
  timezone: string
  secondRunTime: string | null
  model: string
  sections: {
    focus: BriefingSection
    calendar: BriefingSection
    tasks: BriefingSection
    email: BriefingSection
    teams: BriefingSection
    okrs: BriefingSection
  }
}

export interface CalendarAccount {
  provider: "outlook" | "icloud"
  label: string
  calendarType: "work" | "personal"
  enabled: boolean
}

export interface AppSettings {
  id: string
  userId: string
  calendarConfig: {
    accounts: CalendarAccount[]
    includeInBrief: boolean
  }
  tasksConfig: {
    doThisNextAlgorithm:
      | "importance_then_due_date"
      | "due_date_first"
      | "manual"
    includeInBrief: boolean
  }
  emailConfig: {
    lookbackHours: number
    urgentKeywords: string[]
    includeInBrief: boolean
  }
  teamsConfig: {
    monitoredChannels: string[]
    lookbackHours: number
    includeInBrief: boolean
  }
  okrsConfig: {
    cadence: "quarterly" | "annual" | "monthly"
    progressMethod: "manual_percentage" | "milestone_based"
    includeInBrief: boolean
  }
  briefingConfig: BriefingConfig
  notificationsConfig: {
    calendar: boolean
    tasks: boolean
    email: boolean
    okrs: boolean
    batchTimes: string[]
  }
  ritualsConfig: {
    morningKickoffTime: string
    endOfDayTime: string
  }
  weeklyReviewConfig: {
    preferredDay:
      | "monday"
      | "tuesday"
      | "wednesday"
      | "thursday"
      | "friday"
    reminderEnabled: boolean
  }
}
