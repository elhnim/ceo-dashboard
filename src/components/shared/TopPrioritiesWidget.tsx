import { ListTodoIcon } from "lucide-react"

import { DashboardWidget } from "@/components/shared/DashboardWidget"

const emptySlots = [1, 2, 3] as const

export function TopPrioritiesWidget() {
  return (
    <DashboardWidget
      title="Top 3 Priorities"
      icon={<ListTodoIcon className="size-4 text-primary" />}
    >
      <div className="space-y-4">
        <div className="space-y-3">
          {emptySlots.map((slot) => (
            <div
              key={slot}
              className="flex items-center gap-3 rounded-2xl border border-dashed border-border/80 bg-muted/20 px-4 py-3"
            >
              <div className="flex size-8 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                {slot}
              </div>
              <p className="text-sm text-muted-foreground">Priority slot open</p>
            </div>
          ))}
        </div>
        <p className="text-sm leading-6 text-muted-foreground">
          Complete your morning kickoff to set priorities.
        </p>
      </div>
    </DashboardWidget>
  )
}
