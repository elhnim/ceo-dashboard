import Link from "next/link"
import { ChevronRightIcon, HandshakeIcon } from "lucide-react"

import { CommitmentBadge, OverdueBadge } from "@/components/console/badges"
import { formatDate } from "@/lib/console/format"
import type { Commitment } from "@/types/console"

export function CommitmentRow({
  commitment,
  ownerName,
  overdue = false,
}: {
  commitment: Commitment
  ownerName: string
  overdue?: boolean
}) {
  return (
    <Link
      href={`/commitments/${commitment.id}`}
      className="group flex items-center gap-4 rounded-xl border border-border/60 bg-card px-4 py-3.5 ring-1 ring-foreground/[0.02] transition-colors hover:border-border"
    >
      <HandshakeIcon className="size-5 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <CommitmentBadge status={commitment.status} />
          {overdue ? <OverdueBadge /> : null}
        </div>
        <p className="mt-1.5 truncate text-sm font-medium">{commitment.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {ownerName}
          {commitment.dueDate ? ` · due ${formatDate(commitment.dueDate)}` : ""}
        </p>
      </div>
      <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
}
