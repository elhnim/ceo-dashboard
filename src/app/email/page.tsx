import { EmailTriageList } from "@/components/email/EmailTriageList"
import { requireAuth } from "@/lib/auth"
import {
  EmailCacheSchemaError,
  getUntriagedEmails,
} from "@/lib/services/email-cache"
import type { Email } from "@/types/email"

export default async function EmailPage() {
  await requireAuth()
  let initialEmails: Email[] = []
  let loadError: string | null = null

  try {
    initialEmails = await getUntriagedEmails()
  } catch (error) {
    if (error instanceof EmailCacheSchemaError) {
      loadError = error.message
    } else {
      throw error
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8">
      <section className="rounded-[28px] border border-border/70 bg-gradient-to-br from-card via-card to-muted/60 p-6 shadow-sm md:p-8">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground">
          Inbox focus
        </p>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Email Triage
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              High importance &amp; flagged, synced into one focused queue.
            </p>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Keep the signal visible, archive the noise fast, and turn anything
            that needs follow-up into a deliberate next step.
          </p>
        </div>
      </section>

      {loadError ? (
        <section className="rounded-[24px] border border-destructive/30 bg-destructive/5 px-5 py-4 text-sm text-destructive shadow-sm">
          {loadError}
        </section>
      ) : null}

      <EmailTriageList initialEmails={initialEmails} />
    </div>
  )
}
