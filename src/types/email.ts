export type EmailAction = "reply_later" | "delegate" | "archive" | "done"

export type Email = {
  id: string
  externalId: string
  subject: string
  sender: string
  senderEmail: string
  receivedAt: string
  isUrgent: boolean
  isFlagged: boolean
  bodyPreview: string
  actionTaken: EmailAction | null
  syncedAt: string
}
