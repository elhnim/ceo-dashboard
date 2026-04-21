import type { Message } from "@microsoft/microsoft-graph-types"

import {
  getGraphClient,
  toMicrosoftGraphError,
} from "@/lib/services/microsoft-graph"
import type { Email, EmailProvider } from "@/types/integrations"

type GraphMessagesResponse = {
  value?: Message[]
}

function mapMessageToEmail(message: Message): Email {
  const senderName =
    message.from?.emailAddress?.name?.trim() ||
    message.from?.emailAddress?.address?.trim() ||
    "Unknown"
  const senderEmail = message.from?.emailAddress?.address?.trim() || senderName

  return {
    id: message.id ?? "",
    externalId: message.id ?? "",
    subject: message.subject?.trim() || "(No subject)",
    sender: senderName,
    senderEmail,
    receivedAt: message.receivedDateTime || new Date(0).toISOString(),
    isUrgent: message.importance === "high",
    isFlagged: message.flag?.flagStatus === "flagged",
    bodyPreview: message.bodyPreview?.trim() || "",
  }
}

export class OutlookEmailProvider implements EmailProvider {
  constructor(private readonly accessToken: string) {}

  async getUrgentEmails(since: Date): Promise<Email[]> {
    try {
      const response = (await getGraphClient(this.accessToken)
        .api("/me/messages")
        .filter(
          `receivedDateTime ge ${since.toISOString()} and (importance eq 'high' or flag/flagStatus eq 'flagged')`,
        )
        .select("id,subject,from,receivedDateTime,importance,flag,bodyPreview")
        .orderby("receivedDateTime desc")
        .top(50)
        .get()) as GraphMessagesResponse

      return (response.value ?? [])
        .map(mapMessageToEmail)
        .filter((email) => email.externalId.length > 0)
    } catch (error) {
      throw toMicrosoftGraphError(error)
    }
  }
}
