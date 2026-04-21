import type { EmailCacheInsert } from "@/types/database"
import { createAdminClient } from "@/lib/supabase/admin"
import { OutlookEmailProvider } from "@/lib/services/email-outlook"

export async function syncEmails(accessToken: string): Promise<number> {
  const supabase = createAdminClient()
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const provider = new OutlookEmailProvider(accessToken)
  const emails = await provider.getUrgentEmails(since)

  if (emails.length === 0) {
    return 0
  }

  const payload: EmailCacheInsert[] = emails.map((email) => ({
    external_id: email.externalId,
    subject: email.subject,
    sender: email.sender,
    sender_email: email.senderEmail,
    received_at: email.receivedAt,
    is_urgent: email.isUrgent,
    is_flagged: email.isFlagged,
    body_preview: email.bodyPreview,
    synced_at: new Date().toISOString(),
  }))

  const { error } = await supabase
    .from("emails_cache")
    .upsert(payload, { onConflict: "external_id" })

  if (error) {
    throw new Error(error.message)
  }

  return payload.length
}
