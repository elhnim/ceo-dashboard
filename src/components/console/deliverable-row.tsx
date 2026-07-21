import Link from "next/link"
import { ChevronRightIcon, FileTextIcon } from "lucide-react"

import { ReviewBadge } from "@/components/console/badges"
import { DeliverableTypeLabel } from "@/lib/console/domain/enums"
import { formatRelative } from "@/lib/console/format"
import type { Deliverable } from "@/types/console"

export function DeliverableRow({
  deliverable,
  authorName,
  href,
}: {
  deliverable: Deliverable
  authorName: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-xl border border-border/60 bg-card px-4 py-3.5 ring-1 ring-foreground/[0.02] transition-colors hover:border-border"
    >
      <FileTextIcon className="size-5 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{deliverable.title}</p>
          <span className="shrink-0 text-xs text-muted-foreground">v{deliverable.version}</span>
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {DeliverableTypeLabel[deliverable.type]} · {authorName} · {formatRelative(deliverable.createdAt)}
        </p>
      </div>
      <ReviewBadge status={deliverable.reviewStatus} />
      <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
}
