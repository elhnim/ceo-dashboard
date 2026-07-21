import Link from "next/link"
import { ChevronRightIcon } from "lucide-react"

import { PriorityBadge, StatusBadge } from "@/components/console/badges"
import { formatDate } from "@/lib/console/format"
import type { WorkAssignment } from "@/types/console"

export function AssignmentRow({
  assignment,
  ownerName,
}: {
  assignment: WorkAssignment
  ownerName: string
}) {
  return (
    <Link
      href={`/console/work/${assignment.id}`}
      className="group flex items-center gap-4 rounded-xl border border-border/60 bg-card px-4 py-3.5 ring-1 ring-foreground/[0.02] transition-colors hover:border-border"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <PriorityBadge priority={assignment.priority} />
          <StatusBadge status={assignment.status} />
        </div>
        <p className="mt-1.5 truncate text-sm font-medium">{assignment.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {ownerName}
          {assignment.dueDate ? ` · due ${formatDate(assignment.dueDate)}` : ""}
        </p>
      </div>
      <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
}
