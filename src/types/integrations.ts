export type CalendarProviderName = "outlook" | "icloud"

export type CalendarType = "work" | "personal"

export interface CalendarEvent {
  id: string
  provider: CalendarProviderName
  title: string
  startAt: Date
  endAt: Date
  attendees: string[]
  location: string | null
  calendarType: CalendarType
  isAllDay: boolean
}

export interface Task {
  id: string
  externalId: string
  title: string
  dueDate: string | null
  importance: "low" | "normal" | "high"
  status: "notStarted" | "inProgress" | "completed"
}

export interface Email {
  id: string
  externalId: string
  subject: string
  sender: string
  senderEmail: string
  receivedAt: string
  isUrgent: boolean
  isFlagged: boolean
  bodyPreview: string
}

export interface TeamsMention {
  id: string
  channelName: string | null
  chatType: "channel" | "chat"
  messagePreview: string
  actionRequired: boolean
  receivedAt: string
}

export interface ChannelSummary {
  channelId: string
  channelName: string
  teamName?: string | null
  issues: string[]
  decisions: string[]
  period: { from: string; to: string }
}

export interface CalendarProvider {
  getEvents(from: Date, to: Date): Promise<CalendarEvent[]>
}

export interface TaskProvider {
  getTasks(): Promise<Task[]>
}

export interface EmailProvider {
  getUrgentEmails(since: Date): Promise<Email[]>
}

export interface TeamsProvider {
  getMentions(since: Date): Promise<TeamsMention[]>
  getChannelSummaries(
    channelIds: string[],
    since: Date,
  ): Promise<ChannelSummary[]>
}
