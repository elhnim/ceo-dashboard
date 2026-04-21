import "server-only"

import type { EmailCache, EmailCacheUpdate } from "@/types/database"
import type { EmailAction, Email } from "@/types/email"
import { createClient } from "@/lib/supabase/server"

export class EmailCacheSchemaError extends Error {
  constructor(message = "Email cache schema is not available in Supabase yet.") {
    super(message)
    this.name = "EmailCacheSchemaError"
  }
}

function formatEmailCacheError(message: string) {
  if (
    message.includes("schema cache") ||
    message.includes("emails_cache") ||
    message.includes('relation "emails_cache" does not exist')
  ) {
    return new EmailCacheSchemaError(
      "Supabase can’t read the email cache table yet. Run the email cache migration, then try again.",
    )
  }

  return new Error(message)
}

function mapEmailRow(row: EmailCache): Email {
  return {
    id: row.external_id,
    externalId: row.external_id,
    subject: row.subject,
    sender: row.sender,
    senderEmail: row.sender_email,
    receivedAt: row.received_at,
    isUrgent: row.is_urgent,
    isFlagged: row.is_flagged,
    bodyPreview: row.body_preview ?? "",
    actionTaken: row.action_taken as EmailAction | null,
    syncedAt: row.synced_at,
  }
}

export async function getUntriagedEmails(): Promise<Email[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("emails_cache")
    .select("*")
    .is("action_taken", null)
    .order("received_at", { ascending: false })

  if (error) {
    throw formatEmailCacheError(error.message)
  }

  return ((data ?? []) as EmailCache[]).map(mapEmailRow)
}

export async function getUntriagedUrgentEmailCount(): Promise<number> {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from("emails_cache")
    .select("external_id", { count: "exact", head: true })
    .eq("is_urgent", true)
    .is("action_taken", null)

  if (error) {
    throw formatEmailCacheError(error.message)
  }

  return count ?? 0
}

export async function setEmailAction(
  externalId: string,
  action: EmailAction,
): Promise<void> {
  const supabase = await createClient()
  const payload: EmailCacheUpdate = {
    action_taken: action,
  }

  const { error } = await supabase
    .from("emails_cache")
    .update(payload)
    .eq("external_id", externalId)

  if (error) {
    throw formatEmailCacheError(error.message)
  }
}
