import { InboxIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { DashboardWidget } from "@/components/shared/DashboardWidget"

export function UrgentEmailWidget() {
  return (
    <DashboardWidget
      title="Urgent Emails"
      icon={<InboxIcon className="size-4 text-primary" />}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/20 px-4 py-4">
          <div>
            <p className="text-sm font-medium">Email triage</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Coming in Phase 5
            </p>
          </div>
          <Badge variant="outline">0 flagged</Badge>
        </div>
        <p className="text-sm leading-6 text-muted-foreground">
          This space will surface the urgent and important messages that deserve
          action without pulling the full inbox into view.
        </p>
      </div>
    </DashboardWidget>
  )
}
