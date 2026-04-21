import "server-only"

import { Client, GraphError } from "@microsoft/microsoft-graph-client"
import type { Message } from "@microsoft/microsoft-graph-types"

import { auth } from "@/lib/auth-config"
import type { Email } from "@/types/email"

type GraphMessagesResponse = {
  value?: Message[]
}

export class MicrosoftGraphError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "MicrosoftGraphError"
    this.status = status
  }
}

function normalizeEmail(message: Message): Email {
  return {
    id: message.id ?? "",
    subject: message.subject?.trim() || "(No subject)",
    from: {
      emailAddress: {
        name: message.from?.emailAddress?.name?.trim() || "Unknown sender",
        address: message.from?.emailAddress?.address?.trim() || "",
      },
    },
    receivedDateTime: message.receivedDateTime || new Date(0).toISOString(),
    importance: message.importance || "normal",
    isRead: message.isRead ?? false,
    flag: {
      flagStatus: message.flag?.flagStatus || "notFlagged",
    },
    bodyPreview: message.bodyPreview?.trim() || "",
  }
}

function toMicrosoftGraphError(error: unknown): MicrosoftGraphError {
  if (error instanceof MicrosoftGraphError) {
    return error
  }

  if (error instanceof GraphError) {
    return new MicrosoftGraphError(
      error.message || "Microsoft Graph request failed.",
      error.statusCode,
    )
  }

  const message =
    error instanceof Error ? error.message : "Microsoft Graph request failed."

  return new MicrosoftGraphError(message, 500)
}

export function getGraphClient(accessToken: string): Client {
  return Client.init({
    authProvider: (done) => {
      done(null, accessToken)
    },
  })
}

export async function getSessionToken(req: Request): Promise<string> {
  void req
  const session = await auth()

  if (!session?.accessToken) {
    throw new Error("Microsoft access token is not available")
  }

  if (session.error === "RefreshAccessTokenError") {
    throw new Error("Microsoft access token could not be refreshed")
  }

  if (
    typeof session.expiresAt === "number" &&
    Date.now() >= session.expiresAt * 1000
  ) {
    throw new Error("Microsoft access token has expired")
  }

  return session.accessToken
}

export async function getUrgentEmails(accessToken: string): Promise<Email[]> {
  try {
    const result = (await getGraphClient(accessToken)
      .api("/me/messages")
      .filter("importance eq 'high' or flag/flagStatus eq 'flagged'")
      .select([
        "id",
        "subject",
        "from",
        "receivedDateTime",
        "importance",
        "isRead",
        "flag",
        "bodyPreview",
      ])
      .orderby("receivedDateTime desc")
      .top(50)
      .get()) as GraphMessagesResponse

    return (result.value || []).map(normalizeEmail)
  } catch (error) {
    throw toMicrosoftGraphError(error)
  }
}

export async function markAsRead(accessToken: string, id: string): Promise<void> {
  try {
    await getGraphClient(accessToken).api(`/me/messages/${id}`).update({
      isRead: true,
    })
  } catch (error) {
    throw toMicrosoftGraphError(error)
  }
}

export async function archiveEmail(accessToken: string, id: string): Promise<void> {
  try {
    await getGraphClient(accessToken).api(`/me/messages/${id}/move`).post({
      destinationId: "archive",
    })
  } catch (error) {
    throw toMicrosoftGraphError(error)
  }
}

export async function flagEmail(accessToken: string, id: string): Promise<void> {
  try {
    await getGraphClient(accessToken).api(`/me/messages/${id}`).update({
      flag: {
        flagStatus: "flagged",
      },
    })
  } catch (error) {
    throw toMicrosoftGraphError(error)
  }
}

export async function createReply(
  accessToken: string,
  id: string,
): Promise<string> {
  try {
    const reply = (await getGraphClient(accessToken)
      .api(`/me/messages/${id}/createReply`)
      .post(null)) as Message

    if (!reply.id) {
      throw new MicrosoftGraphError(
        "Microsoft Graph did not return a reply draft ID.",
        502,
      )
    }

    return reply.id
  } catch (error) {
    throw toMicrosoftGraphError(error)
  }
}
