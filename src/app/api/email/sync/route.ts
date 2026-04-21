import { requireAuth } from "@/lib/auth"
import { EmailCacheSchemaError } from "@/lib/services/email-cache"
import { MicrosoftGraphError } from "@/lib/services/microsoft-graph"
import { syncEmails } from "@/lib/services/email-sync"

function getAccessToken(session: Awaited<ReturnType<typeof requireAuth>>) {
  if (!session.accessToken) {
    throw new Error("Microsoft access token is not available")
  }

  return session.accessToken
}

export async function POST() {
  try {
    const session = await requireAuth()
    const syncedCount = await syncEmails(getAccessToken(session))

    return Response.json({ ok: true, syncedCount })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to sync emails"
    const status =
      error instanceof MicrosoftGraphError
        ? error.status
        : error instanceof EmailCacheSchemaError
          ? 503
          : 500

    return Response.json({ ok: false, error: message }, { status })
  }
}
