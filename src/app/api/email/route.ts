import { requireAuth } from "@/lib/auth"
import {
  EmailCacheSchemaError,
  getUntriagedEmails,
} from "@/lib/services/email-cache"

export async function GET() {
  try {
    await requireAuth()
    const emails = await getUntriagedEmails()

    return Response.json({ emails })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load urgent emails"
    const status = error instanceof EmailCacheSchemaError ? 503 : 500

    return Response.json({ emails: [], error: message }, { status })
  }
}
