import {
  ActivityEventTypeLabel,
} from "@/lib/console/domain/enums"
import type { ActivityEventType } from "@/lib/console/domain/enums"
import { formatRelative } from "@/lib/console/format"
import type { ActivityEvent } from "@/types/console"
import { cn } from "@/lib/utils"

const DOT: Partial<Record<ActivityEventType, string>> = {
  "officer-blocked": "bg-red-500",
  "deliverable-approved": "bg-emerald-500",
  "deliverable-submitted": "bg-amber-500",
  "decision-requested": "bg-amber-500",
  "constitutional-decision": "bg-sky-500",
  "officer-unblocked": "bg-emerald-500",
}

export function ActivityList({ events }: { events: ActivityEvent[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-muted-foreground">No activity yet.</p>
  }
  return (
    <ol className="relative space-y-0 border-l border-border/60 pl-6">
      {events.map((event) => (
        <li key={event.id} className="relative pb-6 last:pb-0">
          <span
            className={cn(
              "absolute -left-[1.6rem] top-1 size-2.5 rounded-full ring-4 ring-background",
              DOT[event.eventType] ?? "bg-muted-foreground/50",
            )}
          />
          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
            <p className="text-sm font-medium">{event.title}</p>
            <time className="text-xs text-muted-foreground">{formatRelative(event.occurredAt)}</time>
          </div>
          <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">
            {ActivityEventTypeLabel[event.eventType]}
          </p>
          {event.description ? (
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{event.description}</p>
          ) : null}
        </li>
      ))}
    </ol>
  )
}
