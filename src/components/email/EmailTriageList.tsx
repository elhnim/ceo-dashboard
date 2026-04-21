"use client"

import { CheckCheckIcon, RefreshCcwIcon } from "lucide-react"
import { toast } from "sonner"

import { EmailQuickActions } from "@/components/email/EmailQuickActions"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useEmails } from "@/hooks/use-emails"
import type { Email, EmailAction } from "@/types/email"

type EmailTriageListProps = {
  initialEmails: Email[]
}

function formatReceivedAt(value: string) {
  const receivedAt = new Date(value)
  const now = new Date()
  const diff = now.getTime() - receivedAt.getTime()
  const hour = 1000 * 60 * 60
  const day = hour * 24

  if (diff < hour) {
    const minutes = Math.max(1, Math.round(diff / (1000 * 60)))
    return `${minutes}m ago`
  }

  if (diff < day) {
    const hours = Math.max(1, Math.round(diff / hour))
    return `${hours}h ago`
  }

  if (diff < day * 2) {
    return "Yesterday"
  }

  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
  }).format(receivedAt)
}

function getActionMessage(action: EmailAction) {
  if (action === "reply_later") {
    return "Email marked for later"
  }

  if (action === "delegate") {
    return "Email marked for delegation"
  }

  if (action === "archive") {
    return "Email archived"
  }

  return "Email marked done"
}

export function EmailTriageList({ initialEmails }: EmailTriageListProps) {
  const { emails, error, isLoading, isSyncing, actioningIds, sync, act } =
    useEmails({
      initialEmails,
    })

  async function handleSync() {
    try {
      await sync()
      toast.success("Email cache synced")
    } catch (nextError) {
      toast.error(
        nextError instanceof Error ? nextError.message : "Unable to sync emails",
      )
    }
  }

  async function handleAction(emailId: string, action: EmailAction) {
    try {
      await act(emailId, action)
      toast.success(getActionMessage(action))
    } catch (nextError) {
      toast.error(
        nextError instanceof Error ? nextError.message : "Unable to update email",
      )
    }
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-border/70 bg-card/80 px-4 py-4 shadow-sm">
        <div>
          <p className="text-sm font-medium">Untriaged email queue</p>
          <p className="text-sm text-muted-foreground">
            {emails.length} messages waiting for triage
          </p>
        </div>

        <Button variant="outline" disabled={isSyncing} onClick={() => void handleSync()}>
          <RefreshCcwIcon className={cn(isSyncing && "animate-spin")} />
          {isSyncing ? "Syncing…" : "Sync"}
        </Button>
      </section>

      {error ? (
        <section className="rounded-[24px] border border-destructive/30 bg-destructive/5 px-5 py-4 text-sm text-destructive shadow-sm">
          {error}
        </section>
      ) : null}

      {isLoading && emails.length === 0 ? (
        <section className="rounded-[28px] border border-dashed border-border/70 bg-muted/20 px-6 py-12 text-center shadow-sm">
          <p className="text-sm text-muted-foreground">Loading urgent emails…</p>
        </section>
      ) : null}

      {!isLoading && emails.length === 0 ? (
        <section className="rounded-[28px] border border-dashed border-border/70 bg-muted/20 px-6 py-12 text-center shadow-sm">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCheckIcon className="size-7" />
          </div>
          <h2 className="mt-5 text-2xl font-semibold tracking-tight">
            No urgent emails. You&apos;re all clear.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            Run a sync anytime to pull the latest flagged and high-importance
            messages from Outlook.
          </p>
        </section>
      ) : null}

      {emails.length > 0 ? (
        <section className="space-y-4">
          {emails.map((email) => {
            const isPending = Boolean(actioningIds[email.id])

            return (
              <article
                key={email.id}
                className="group rounded-[28px] border border-border/70 bg-card p-5 shadow-sm transition-colors hover:border-primary/30"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{email.sender}</p>
                      <p className="text-sm text-muted-foreground">
                        {email.senderEmail}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-lg font-semibold tracking-tight">
                        {email.subject}
                      </h2>
                      <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                        {email.bodyPreview || "No preview available."}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    {email.isUrgent ? (
                      <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-medium text-white">
                        Urgent
                      </span>
                    ) : null}
                    {email.isFlagged ? (
                      <span className="rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground">
                        Flagged
                      </span>
                    ) : null}
                    <span className="text-sm text-muted-foreground">
                      {formatReceivedAt(email.receivedAt)}
                    </span>
                  </div>
                </div>

                <div
                  className={cn(
                    "mt-4 transition duration-200 md:translate-y-1 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100",
                    isPending && "md:translate-y-0 md:opacity-100",
                  )}
                >
                  <EmailQuickActions
                    emailId={email.id}
                    disabled={isPending}
                    onAction={handleAction}
                  />
                </div>
              </article>
            )
          })}
        </section>
      ) : null}
    </div>
  )
}
