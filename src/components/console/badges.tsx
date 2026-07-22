import {
  CommitmentStatusLabel,
  ConfidenceLevelLabel,
  DecisionStageLabel,
  DecisionTypeLabel,
  OrganizationHealthLabel,
  PriorityLabel,
  ReviewStatusLabel,
  WorkAssignmentStatusLabel,
} from "@/lib/console/domain/enums"
import type {
  CommitmentStatus,
  ConfidenceLevel,
  DecisionStage,
  DecisionType,
  OrganizationHealth,
  Priority,
  ReviewStatus,
  WorkAssignmentStatus,
} from "@/lib/console/domain/enums"
import { cn } from "@/lib/utils"

const HEALTH_DOT: Record<OrganizationHealth, string> = {
  healthy: "bg-emerald-500",
  "attention-required": "bg-amber-500",
  critical: "bg-red-500",
}

const HEALTH_COLOR_WORD: Record<OrganizationHealth, string> = {
  healthy: "Green",
  "attention-required": "Yellow",
  critical: "Red",
}

export function HealthBadge({
  health,
  showColorWord = false,
  className,
}: {
  health: OrganizationHealth
  /** Prefix the label with the traffic-light word (Green/Yellow/Red). */
  showColorWord?: boolean
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-3 py-1 text-xs font-medium",
        className,
      )}
    >
      <span className={cn("size-2 rounded-full", HEALTH_DOT[health])} />
      {showColorWord
        ? `${HEALTH_COLOR_WORD[health]} · ${OrganizationHealthLabel[health]}`
        : OrganizationHealthLabel[health]}
    </span>
  )
}

const COMMITMENT_STYLE: Partial<Record<CommitmentStatus, string>> = {
  blocked: "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",
  "in-progress": "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400",
  completed: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  verified: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  committed: "border-border bg-muted text-foreground/80",
}

export function CommitmentBadge({ status }: { status: CommitmentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-full border px-2 text-xs font-medium",
        COMMITMENT_STYLE[status] ?? "border-border bg-transparent text-muted-foreground",
      )}
    >
      {status === "completed" ? "Delivered — verify" : CommitmentStatusLabel[status]}
    </span>
  )
}

export function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
  return (
    <span className="inline-flex h-5 items-center rounded-full border border-border bg-transparent px-2 text-xs font-medium text-muted-foreground">
      {ConfidenceLevelLabel[level]} confidence
    </span>
  )
}

export function StageBadge({ stage }: { stage: DecisionStage }) {
  return (
    <span className="inline-flex h-5 items-center rounded-full border border-border bg-muted/50 px-2 text-xs font-medium text-muted-foreground">
      {DecisionStageLabel[stage]}
    </span>
  )
}

export function OverdueBadge() {
  return (
    <span className="inline-flex h-5 items-center rounded-full border border-red-500/30 bg-red-500/10 px-2 text-xs font-medium text-red-600 dark:text-red-400">
      Overdue
    </span>
  )
}

const PRIORITY_STYLE: Record<Priority, string> = {
  critical: "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",
  high: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  medium: "border-border bg-muted text-muted-foreground",
  low: "border-border bg-transparent text-muted-foreground",
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-full border px-2 text-xs font-medium",
        PRIORITY_STYLE[priority],
      )}
    >
      {PriorityLabel[priority]}
    </span>
  )
}

const STATUS_STYLE: Partial<Record<WorkAssignmentStatus, string>> = {
  blocked: "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",
  review: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "in-progress": "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400",
  completed: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  approved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  cancelled: "border-border bg-muted text-muted-foreground line-through",
}

export function StatusBadge({ status }: { status: WorkAssignmentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-full border px-2 text-xs font-medium",
        STATUS_STYLE[status] ?? "border-border bg-muted text-muted-foreground",
      )}
    >
      {WorkAssignmentStatusLabel[status]}
    </span>
  )
}

const REVIEW_STYLE: Record<ReviewStatus, string> = {
  draft: "border-border bg-muted text-muted-foreground",
  submitted: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  approved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "revision-requested": "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  rejected: "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",
}

export function ReviewBadge({ status }: { status: ReviewStatus }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center rounded-full border px-2 text-xs font-medium",
        REVIEW_STYLE[status],
      )}
    >
      {ReviewStatusLabel[status]}
    </span>
  )
}

export function TypeBadge({ type }: { type: DecisionType }) {
  return (
    <span className="inline-flex h-5 items-center rounded-full border border-border bg-transparent px-2 text-xs font-medium text-muted-foreground">
      {DecisionTypeLabel[type]}
    </span>
  )
}
