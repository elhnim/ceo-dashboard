import Link from "next/link"
import {
  ArrowUpRightIcon,
  BriefcaseBusinessIcon,
  CalendarIcon,
  CheckSquareIcon,
  TargetIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { DashboardWidget } from "@/components/shared/DashboardWidget"

const quickActions = [
  {
    title: "Add Business",
    href: "/businesses",
    icon: BriefcaseBusinessIcon,
  },
  {
    title: "Create OKR",
    href: "/okrs",
    icon: TargetIcon,
  },
  {
    title: "View Tasks",
    href: "/tasks",
    icon: CheckSquareIcon,
  },
  {
    title: "Check Calendar",
    href: "/calendar",
    icon: CalendarIcon,
  },
] as const

export function QuickActionsWidget() {
  return (
    <DashboardWidget
      title="Quick Actions"
      icon={<ArrowUpRightIcon className="size-4 text-primary" />}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {quickActions.map(({ title, href, icon: Icon }) => (
          <Button
            key={href}
            variant="outline"
            size="lg"
            className="justify-start"
            render={<Link href={href} />}
          >
            <Icon />
            {title}
          </Button>
        ))}
      </div>
    </DashboardWidget>
  )
}
