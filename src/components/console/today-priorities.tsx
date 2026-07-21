import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { PriorityBadge } from "@/components/console/badges"
import { minutes } from "@/lib/console/format"
import type { TodayPriority } from "@/lib/console/domain/logic"
import { cn } from "@/lib/utils"

const KIND_LABEL: Record<TodayPriority["kind"], string> = {
  decision: "Decide",
  review: "Review",
  blocker: "Unblock",
}

const CONFIDENCE_LABEL: Record<TodayPriority["confidence"], string> = {
  high: "High confidence",
  medium: "Needs your judgment",
  low: "Open question",
}

/**
 * The dominant section of the Executive Brief: the 3–5 things worth the
 * Director's next 30 minutes, ranked. Each card carries enough context to act
 * without opening anything else first.
 */
export function TodayPriorities({ items }: { items: TodayPriority[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-border/70 bg-card px-6 py-10 text-center">
        <p className="text-base font-semibold">Nothing demands your attention today</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          No decisions waiting, nothing blocked, nothing to review. The
          organization is executing.
        </p>
      </div>
    )
  }

  const totalMinutes = items.reduce((sum, i) => sum + i.estimatedMinutes, 0)

  return (
    <div>
      <ol className="space-y-3">
        {items.map((item, index) => (
          <li key={`${item.kind}-${item.id}`}>
            <Link
              href={item.href}
              className={cn(
                "group flex items-start gap-4 rounded-2xl border bg-card p-4 ring-1 ring-foreground/[0.02] transition-colors sm:gap-5 sm:p-5",
                index === 0
                  ? "border-foreground/25 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_10px_28px_-18px_rgba(0,0,0,0.25)]"
                  : "border-border/60 hover:border-border",
              )}
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold tabular-nums sm:size-9",
                  index === 0
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground",
                )}
              >
                {index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {KIND_LABEL[item.kind]}
                  </span>
                  <PriorityBadge priority={item.priority} />
                  <span className="text-xs text-muted-foreground">
                    {minutes(item.estimatedMinutes)} · {CONFIDENCE_LABEL[item.confidence]}
                  </span>
                </span>
                <span className="mt-1.5 block text-base font-semibold leading-snug tracking-tight sm:text-lg">
                  {item.title}
                </span>
                <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                  {item.whyItMatters}
                </span>
                <span className="mt-2 block text-sm font-medium text-foreground/85">
                  {item.recommendedAction}
                </span>
              </span>
              <ArrowRightIcon className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-xs text-muted-foreground">
        About {totalMinutes} minutes to clear all {items.length}.
      </p>
    </div>
  )
}
