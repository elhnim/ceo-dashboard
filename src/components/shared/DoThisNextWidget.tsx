import Link from "next/link"
import { ArrowRightIcon, SparklesIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DashboardWidget } from "@/components/shared/DashboardWidget"

export function DoThisNextWidget() {
  return (
    <DashboardWidget
      title="Do This Next"
      icon={<SparklesIcon className="size-4 text-primary" />}
      className="border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card"
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="text-3xl font-semibold tracking-tight">No priority set yet</p>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            Keep this space reserved for the single next action that will create
            the most momentum today.
          </p>
        </div>
        <Button size="lg" render={<Link href="/tasks" />}>
          Set up your morning kickoff
          <ArrowRightIcon />
        </Button>
      </div>
    </DashboardWidget>
  )
}
