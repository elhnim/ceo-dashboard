import type { ReactNode } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type DashboardWidgetProps = {
  title: string
  icon?: ReactNode
  children: ReactNode
  className?: string
}

export function DashboardWidget({
  title,
  icon,
  children,
  className,
}: DashboardWidgetProps) {
  return (
    <Card className={cn("border-border/70 shadow-sm", className)}>
      <CardHeader className="space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          {icon}
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
