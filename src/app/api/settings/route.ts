import type { Session } from "next-auth"

import { requireAuth } from "@/lib/auth"
import {
  getSettings,
  SettingsSchemaError,
  updateSettings,
} from "@/lib/services/settings"
import type { AppSettings } from "@/types/settings"

function getSettingsUserId(session: Session | null) {
  const email = session?.user?.email?.trim()

  if (!email) {
    throw new Error("Signed-in Microsoft account is missing an email address.")
  }

  return email
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function parsePatch(value: unknown): Partial<Omit<AppSettings, "id" | "userId">> {
  if (!isObject(value)) {
    throw new Error("Request body must be an object.")
  }

  const allowedKeys = new Set<keyof Omit<AppSettings, "id" | "userId">>([
    "calendarConfig",
    "tasksConfig",
    "emailConfig",
    "teamsConfig",
    "okrsConfig",
    "briefingConfig",
    "notificationsConfig",
    "ritualsConfig",
    "weeklyReviewConfig",
  ])
  const entries = Object.entries(value).filter(([key]) =>
    allowedKeys.has(key as keyof Omit<AppSettings, "id" | "userId">)
  )

  if (entries.length === 0) {
    throw new Error("Request body must include a valid settings section.")
  }

  return Object.fromEntries(entries) as Partial<Omit<AppSettings, "id" | "userId">>
}

export async function GET() {
  try {
    const session = await requireAuth()
    const settings = await getSettings(getSettingsUserId(session))

    return Response.json({ data: settings, error: null })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load settings"
    const status = error instanceof SettingsSchemaError ? 503 : 500

    return Response.json({ data: null, error: message }, { status })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireAuth()
    const settings = await updateSettings(
      getSettingsUserId(session),
      parsePatch(await request.json())
    )

    return Response.json({ data: settings, error: null })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update settings"
    const status =
      error instanceof SettingsSchemaError
        ? 503
        : message.includes("Request body")
          ? 400
          : 500

    return Response.json({ data: null, error: message }, { status })
  }
}
