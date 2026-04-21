<<<<<<< HEAD
export type CalendarProviderName = "outlook" | "icloud"

export type CalendarType = "work" | "personal"

export type EmailAction =
  | "archive"
  | "flag"
  | "reply-later"
  | "delegate"
  | "five-min"

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
  actionTaken?: EmailAction | null
  syncedAt?: string | null
}

export interface EmailProvider {
  getUrgentEmails(since: Date): Promise<Email[]>
}

export interface Task {
  id: string
  externalId: string
  title: string
  dueDate: string | null
  importance: "low" | "normal" | "high"
  status: string
}

export interface TaskProvider {
  getTasks(): Promise<Task[]>
}

export interface TeamsMention {
  id: string
  channelName: string | null
  chatType: "chat" | "channel"
  messagePreview: string
  actionRequired: boolean
  receivedAt: string
}

export interface ChannelSummary {
  channelId: string | null
  channelName: string
  teamName: string | null
  issues: string[]
  decisions: string[]
  period: {
    from: string
    to: string
  }
}

export interface TeamsProvider {
  getMentions(since: Date): Promise<TeamsMention[]>
  getChannelSummaries(channelIds: string[], since: Date): Promise<ChannelSummary[]>
}

export interface CalendarEvent {
  id: string
  provider: CalendarProviderName
=======
export interface CalendarEvent {
  id: string
  provider: "outlook" | "icloud"
>>>>>>> origin/main
  title: string
  startAt: Date
  endAt: Date
  attendees: string[]
  location: string | null
<<<<<<< HEAD
  calendarType: CalendarType
  isAllDay: boolean
}

export interface CalendarProvider {
  getEvents(from: Date, to: Date): Promise<CalendarEvent[]>
}

=======
  calendarType: "work" | "personal"
  isAllDay: boolean
}

>>>>>>> origin/main
export interface Task {
  id: string
  externalId: string
  title: string
  dueDate: string | null
  importance: "low" | "normal" | "high"
  status: "notStarted" | "inProgress" | "completed"
}

<<<<<<< HEAD
export interface TaskProvider {
  getTasks(): Promise<Task[]>
}

=======
>>>>>>> origin/main
export interface Email {
  id: string
  externalId: string
  subject: string
  sender: string
<<<<<<< HEAD
  senderEmail?: string
=======
>>>>>>> origin/main
  receivedAt: string
  isUrgent: boolean
  isFlagged: boolean
  bodyPreview: string
}

<<<<<<< HEAD
export interface EmailProvider {
  getUrgentEmails(since: Date): Promise<Email[]>
}

=======
>>>>>>> origin/main
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

<<<<<<< HEAD
=======
export interface CalendarProvider {
  getEvents(from: Date, to: Date): Promise<CalendarEvent[]>
}

export interface TaskProvider {
  getTasks(): Promise<Task[]>
}

export interface EmailProvider {
  getUrgentEmails(since: Date): Promise<Email[]>
}

>>>>>>> origin/main
export interface TeamsProvider {
  getMentions(since: Date): Promise<TeamsMention[]>
  getChannelSummaries(
    channelIds: string[],
    since: Date,
  ): Promise<ChannelSummary[]>
}
