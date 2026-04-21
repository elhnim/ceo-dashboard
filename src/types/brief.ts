export interface BriefSection {
  content: string
  format: "narrative" | "structured"
}

export interface DailyBrief {
  focus: BriefSection
  calendar: BriefSection
  tasks: BriefSection
  email: BriefSection
  teams: {
    actions: BriefSection
    channels: BriefSection
  }
  okrs: BriefSection
  generatedAt: string
  dataAsOf: string
  triggeredBy: "scheduled" | "manual"
}

export interface SyncLogEntry {
  module: "calendar" | "tasks" | "email" | "teams" | "okrs" | "brief"
  status: "success" | "error"
  syncedAt: string
  errorMessage: string | null
}

export interface BriefSyncHealth {
  hasErrors: boolean
  latestSyncAt: string | null
  latestError: SyncLogEntry | null
}
