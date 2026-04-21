import {
  getGraphClient,
  toMicrosoftGraphError,
} from "@/lib/services/microsoft-graph"
import type { EmailAction } from "@/types/email"

export async function applyEmailAction(
  emailId: string,
  action: EmailAction,
  accessToken: string,
): Promise<void> {
  const client = getGraphClient(accessToken)

  try {
    if (action === "archive") {
      await client.api(`/me/messages/${emailId}/move`).post({
        destinationId: "archive",
      })
      return
    }

    if (action === "done") {
      await client.api(`/me/messages/${emailId}`).patch({
        isRead: true,
        flag: { flagStatus: "complete" },
      })
      return
    }

    if (action === "reply_later") {
      await client.api(`/me/messages/${emailId}`).patch({
        flag: { flagStatus: "flagged" },
      })
    }
  } catch (error) {
    throw toMicrosoftGraphError(error)
  }
}
