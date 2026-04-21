import type { Session } from "next-auth"

import type { EmailAction } from "@/types/email"
import { requireAuth } from "@/lib/auth"
import { applyEmailAction } from "@/lib/services/email-actions"
import {
  EmailCacheSchemaError,
  setEmailAction,
} from "@/lib/services/email-cache"
import { MicrosoftGraphError } from "@/lib/services/microsoft-graph"

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

function getAccessToken(session: Session | null) {
  if (!session?.accessToken) {
    throw new Error("Microsoft access token is not available")
  }

  return session.accessToken
}

function parseAction(value: unknown): EmailAction {
  if (!value || typeof value !== "object") {
    throw new Error("Request body must be an object")
  }

  const action = (value as { action?: unknown }).action

  if (
    action !== "reply_later" &&
    action !== "delegate" &&
    action !== "archive" &&
    action !== "done"
  ) {
    throw new Error("Invalid email action")
  }

  return action as EmailAction
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await requireAuth()
    const { id } = await context.params
    const action = parseAction(await request.json())
    await applyEmailAction(id, action, getAccessToken(session))
    await setEmailAction(id, action)

    return Response.json({ ok: true })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update email"
    const status =
      message === "Request body must be an object" ||
      message === "Invalid email action"
        ? 400
        : error instanceof MicrosoftGraphError
          ? error.status
          : error instanceof EmailCacheSchemaError
            ? 503
            : 500

    return Response.json({ ok: false, error: message }, { status })
  }
}
