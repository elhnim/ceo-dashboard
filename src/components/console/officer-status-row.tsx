import Link from "next/link"
import { ChevronRightIcon } from "lucide-react"

import { StatusBadge } from "@/components/console/badges"
import { formatRelative } from "@/lib/console/format"
import type { OfficerSummary } from "@/lib/console/domain/logic"
import { cn } from "@/lib/utils"

export function OfficerStatusRow({ summary }: { summary: OfficerSummary }) {
  const { person, role, currentAssignments, isBlocked, lastActivityAt } = summary
  const current = currentAssignments[0]

  return (
    <Link
      href={`/console/officers/${summary.officerAssignment.id}`}
      className="group flex items-center gap-4 rounded-xl border border-border/60 bg-card px-4 py-3.5 ring-1 ring-foreground/[0.02] transition-colors hover:border-border"
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
          isBlocked ? "bg-red-500/10 text-red-600 dark:text-red-400" : "bg-muted text-foreground",
        )}
      >
        {person.name.charAt(0)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold">{person.name}</p>
          <span className="truncate text-xs text-muted-foreground">{role.title}</span>
        </div>
        <p className="truncate text-sm text-muted-foreground">
          {current ? current.title : "No active assignment"}
        </p>
      </div>
      <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
        {isBlocked ? (
          <StatusBadge status="blocked" />
        ) : current ? (
          <StatusBadge status={current.status} />
        ) : null}
        {lastActivityAt ? (
          <span className="text-xs text-muted-foreground">{formatRelative(lastActivityAt)}</span>
        ) : null}
      </div>
      <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
}
