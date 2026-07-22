"use client"

import { useMemo, useState } from "react"

import { ActivityList } from "@/components/console/activity-list"
import type { ActivityEventType } from "@/lib/console/domain/enums"
import type { ActivityEvent } from "@/types/console"
import { cn } from "@/lib/utils"

type FilterKey =
  | "all"
  | "commitments"
  | "decisions"
  | "reviews"
  | "work"
  | "governance"

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: "all", label: "Everything" },
  { key: "commitments", label: "Commitments" },
  { key: "decisions", label: "Decisions" },
  { key: "reviews", label: "Reviews" },
  { key: "work", label: "Work" },
  { key: "governance", label: "Governance" },
]

const CATEGORY: Record<ActivityEventType, Exclude<FilterKey, "all">> = {
  "commitment-created": "commitments",
  "commitment-completed": "commitments",
  "commitment-verified": "commitments",
  "commitment-blocked": "commitments",
  "commitment-unblocked": "commitments",
  "decision-requested": "decisions",
  "decision-resolved": "decisions",
  "deliverable-submitted": "reviews",
  "deliverable-approved": "reviews",
  "deliverable-returned": "reviews",
  "assignment-created": "work",
  "assignment-delegated": "work",
  "work-started": "work",
  "question-raised": "work",
  "officer-blocked": "work",
  "officer-unblocked": "work",
  "constitutional-decision": "governance",
}

/** The organization timeline: chronological, filterable, readable. */
export function Timeline({ events }: { events: ActivityEvent[] }) {
  const [filter, setFilter] = useState<FilterKey>("all")

  const visible = useMemo(
    () =>
      filter === "all"
        ? events
        : events.filter((e) => CATEGORY[e.eventType] === filter),
    [events, filter],
  )

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              filter === key
                ? "border-foreground/30 bg-primary text-primary-foreground"
                : "border-border/70 bg-card text-muted-foreground hover:border-border hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      {visible.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nothing in this category yet.
        </p>
      ) : (
        <ActivityList events={visible} />
      )}
    </div>
  )
}
