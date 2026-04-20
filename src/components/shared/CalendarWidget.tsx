import { CalendarDaysIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { DashboardWidget } from "@/components/shared/DashboardWidget"

const timeBlocks = [
  "08:30 Deep work",
  "11:00 Team sync",
  "14:00 Buffer",
  "16:30 Review",
] as const

export function CalendarWidget() {
  return (
    <DashboardWidget
      title="Calendar Time Blocks"
      icon={<CalendarDaysIcon className="size-4 text-primary" />}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm leading-6 text-muted-foreground">
            Calendar is coming in Phase 3.
          </p>
          <Badge variant="outline">Placeholder</Badge>
        </div>
        <div className="space-y-2">
          {timeBlocks.map((block, index) => (
            <div
              key={block}
              className="rounded-2xl border border-border/70 bg-muted/25 px-4 py-3"
              style={{ opacity: 1 - index * 0.12 }}
            >
              <div className="h-3 w-28 rounded-full bg-muted-foreground/20" />
              <p className="mt-2 text-xs text-muted-foreground">{block}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardWidget>
  )
}
