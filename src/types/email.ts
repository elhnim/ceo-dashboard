import type { Email as ProviderEmail } from "@/types/integrations"

export type EmailAction = "reply_later" | "delegate" | "archive" | "done"

export type Email = ProviderEmail & {
  actionTaken: EmailAction | null
  syncedAt: string
}
