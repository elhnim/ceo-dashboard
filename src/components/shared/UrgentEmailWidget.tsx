import Link from "next/link"
import { ArrowRightIcon, InboxIcon } from "lucide-react"

import { DashboardWidget } from "@/components/shared/DashboardWidget"
import { Badge } from "@/components/ui/badge"
import { getUntriagedUrgentEmailCount } from "@/lib/services/email-cache"

function getUrgentEmailLabel(count: number) {
  return count === 1 ? "1 urgent email needs review" : `${count} urgent emails need review`
}

export async function UrgentEmailWidget() {
  const urgentCount = await getUntriagedUrgentEmailCount().catch(() => 0)

  return (
    <DashboardWidget
      title="Urgent Emails"
      icon={<InboxIcon className="size-4 text-primary" />}
    >
      <div className="space-y-4">
        <Link
          href="/email"
          className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/20 px-4 py-4 transition-colors hover:border-primary/40 hover:bg-primary/5"
        >
          <div className="space-y-1">
            <p className="text-sm font-medium">Email triage</p>
            <p className="text-sm text-muted-foreground">
              {getUrgentEmailLabel(urgentCount)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={urgentCount > 0 ? "default" : "outline"}>
              {urgentCount > 0 ? `${urgentCount} urgent` : "All clear"}
            </Badge>
            <ArrowRightIcon className="size-4 text-muted-foreground" />
          </div>
        </Link>
        <p className="text-sm leading-6 text-muted-foreground">
          Open Email Triage to clear high-importance and flagged messages
          without dropping into the full inbox.
        </p>
      </div>
    </DashboardWidget>
  )
}
