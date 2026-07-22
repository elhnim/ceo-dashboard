/**
 * Founder Console — pure derivation logic.
 *
 * All functions here are pure (no I/O, no clock reads via arguments only) so
 * they are trivially unit-testable and reusable on server, client, and a
 * future iOS target. The executive UI reads exclusively through these.
 */

import {
  ACTIVE_WORK_STATUSES,
  DecisionStatus,
  OrganizationHealth,
  PRIORITY_RANK,
  Priority,
  ReviewStatus,
  WorkAssignmentStatus,
} from "./enums"
import type {
  ActivityEvent,
  ConsoleState,
  Decision,
  Deliverable,
  ExecutiveBrief,
  OfficerAssignment,
  Person,
  Role,
  WorkAssignment,
} from "@/types/console"

export interface OrganizationMetrics {
  officersActive: number
  assignmentsInProgress: number
  deliverablesReady: number
  decisionsWaiting: number
  blockedAssignments: number
  workCompletedSinceLastBrief: number
}

/** Decisions still awaiting the Director's judgment, most urgent first. */
export function waitingDecisions(state: ConsoleState): Decision[] {
  return sortByPriority(
    state.decisions.filter((d) => d.status === DecisionStatus.Waiting),
    (d) => d.priority,
  )
}

/** Deliverables submitted and awaiting review. */
export function readyDeliverables(state: ConsoleState): Deliverable[] {
  return state.deliverables
    .filter((d) => d.reviewStatus === ReviewStatus.Submitted)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export function blockedAssignments(state: ConsoleState): WorkAssignment[] {
  return state.workAssignments.filter(
    (a) => a.status === WorkAssignmentStatus.Blocked,
  )
}

export function activeAssignments(state: ConsoleState): WorkAssignment[] {
  return state.workAssignments.filter((a) =>
    ACTIVE_WORK_STATUSES.includes(a.status),
  )
}

/** Sort any items carrying a Priority, most urgent first (stable). */
export function sortByPriority<T>(items: T[], getPriority: (item: T) => Priority): T[] {
  return [...items].sort(
    (a, b) => PRIORITY_RANK[getPriority(a)] - PRIORITY_RANK[getPriority(b)],
  )
}

/**
 * Count work completed since the most recent prior brief. If there is no
 * prior brief, counts all completed/approved work.
 */
export function workCompletedSince(
  state: ConsoleState,
  since: string | null,
): WorkAssignment[] {
  const done = state.workAssignments.filter(
    (a) =>
      a.status === WorkAssignmentStatus.Completed ||
      a.status === WorkAssignmentStatus.Approved,
  )
  if (!since) return done
  return done.filter((a) => a.updatedAt > since)
}

/** The most recent brief, or null. */
export function latestBrief(state: ConsoleState): ExecutiveBrief | null {
  if (state.briefs.length === 0) return null
  return [...state.briefs].sort((a, b) =>
    b.generatedAt.localeCompare(a.generatedAt),
  )[0]
}

export function computeMetrics(state: ConsoleState): OrganizationMetrics {
  const prior = latestBrief(state)
  return {
    officersActive: state.officerAssignments.filter(
      (o) => o.status === "active",
    ).length,
    assignmentsInProgress: state.workAssignments.filter(
      (a) => a.status === WorkAssignmentStatus.InProgress,
    ).length,
    deliverablesReady: readyDeliverables(state).length,
    decisionsWaiting: waitingDecisions(state).length,
    blockedAssignments: blockedAssignments(state).length,
    workCompletedSinceLastBrief: workCompletedSince(
      state,
      prior ? prior.periodEnd : null,
    ).length,
  }
}

/**
 * Derive organization health from live state. Deterministic rules:
 *  - Critical: a critical-priority decision is waiting, or a critical-priority
 *    assignment is blocked.
 *  - Attention required: anything is blocked, waiting, or awaiting review.
 *  - Healthy: none of the above.
 */
export function deriveHealth(state: ConsoleState): OrganizationHealth {
  const waiting = waitingDecisions(state)
  const blocked = blockedAssignments(state)
  const ready = readyDeliverables(state)

  const hasCritical =
    waiting.some((d) => d.priority === Priority.Critical) ||
    blocked.some((a) => a.priority === Priority.Critical)
  if (hasCritical) return OrganizationHealth.Critical

  if (waiting.length > 0 || blocked.length > 0 || ready.length > 0)
    return OrganizationHealth.AttentionRequired

  return OrganizationHealth.Healthy
}

export interface OfficerSummary {
  officerAssignment: OfficerAssignment
  person: Person
  role: Role
  reportsToRole: Role | null
  currentAssignments: WorkAssignment[]
  isBlocked: boolean
  lastActivityAt: string | null
  deliverablesWaiting: number
  decisionsWaiting: number
}

export function officerSummary(
  state: ConsoleState,
  officerAssignmentId: string,
): OfficerSummary | null {
  const officer = state.officerAssignments.find(
    (o) => o.id === officerAssignmentId,
  )
  if (!officer) return null
  const person = state.people.find((p) => p.id === officer.personId)
  const role = state.roles.find((r) => r.id === officer.roleId)
  if (!person || !role) return null
  const reportsToRole = role.reportsToRoleId
    ? state.roles.find((r) => r.id === role.reportsToRoleId) ?? null
    : null

  const currentAssignments = state.workAssignments.filter(
    (a) =>
      a.ownerOfficerAssignmentId === officer.id &&
      a.status !== WorkAssignmentStatus.Completed &&
      a.status !== WorkAssignmentStatus.Cancelled,
  )

  const isBlocked = currentAssignments.some(
    (a) => a.status === WorkAssignmentStatus.Blocked,
  )

  const lastActivity = state.activity
    .filter((e) => e.actorId === officer.id)
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))[0]

  const deliverablesWaiting = state.deliverables.filter(
    (d) =>
      d.authorOfficerAssignmentId === officer.id &&
      d.reviewStatus === ReviewStatus.Submitted,
  ).length

  const decisionsWaiting = state.decisions.filter(
    (d) =>
      d.requestingOfficerAssignmentId === officer.id &&
      d.status === DecisionStatus.Waiting,
  ).length

  return {
    officerAssignment: officer,
    person,
    role,
    reportsToRole,
    currentAssignments,
    isBlocked,
    lastActivityAt: lastActivity ? lastActivity.occurredAt : null,
    deliverablesWaiting,
    decisionsWaiting,
  }
}

export function allOfficerSummaries(state: ConsoleState): OfficerSummary[] {
  return state.officerAssignments
    .map((o) => officerSummary(state, o.id))
    .filter((s): s is OfficerSummary => s !== null)
}

/** Chronological activity feed, newest first. */
export function activityFeed(state: ConsoleState, limit?: number): ActivityEvent[] {
  const sorted = [...state.activity].sort((a, b) =>
    b.occurredAt.localeCompare(a.occurredAt),
  )
  return typeof limit === "number" ? sorted.slice(0, limit) : sorted
}

/**
 * A ranked item for the Executive Brief's "Today's Priorities" section —
 * the answer to "if I only have 30 minutes today, what should I focus on?".
 */
export interface TodayPriority {
  /** Id of the underlying decision, deliverable, or assignment. */
  id: string
  kind: "decision" | "review" | "blocker"
  title: string
  whyItMatters: string
  estimatedMinutes: number
  /** How settled the recommended action is, derived deterministically. */
  confidence: "high" | "medium" | "low"
  recommendedAction: string
  href: string
  priority: Priority
}

const KIND_RANK: Record<TodayPriority["kind"], number> = {
  decision: 0,
  review: 1,
  blocker: 2,
}

/**
 * Derive the 3–5 items the Director should focus on today, ranked by urgency
 * and impact. Pure and deterministic:
 *  - waiting decisions (a decision that unblocks work outranks its peers);
 *  - deliverables awaiting review;
 *  - blocked work not already covered by a listed decision.
 * Confidence is high when a clear recommendation/action exists, medium when
 * judgment is needed, low when the path is genuinely open.
 */
export function todaysPriorities(state: ConsoleState, limit = 5): TodayPriority[] {
  const blocked = blockedAssignments(state)
  const blockedIds = new Set(blocked.map((a) => a.id))
  const items: Array<TodayPriority & { score: number }> = []

  for (const d of waitingDecisions(state)) {
    const unblocks = d.affectedAssignmentIds.filter((id) => blockedIds.has(id))
    const hasRecommendation = d.recommendation.trim().length > 0
    items.push({
      id: d.id,
      kind: "decision",
      title: d.title,
      whyItMatters:
        unblocks.length > 0
          ? `${d.whyItMatters} Deciding this unblocks work in progress.`
          : d.whyItMatters,
      estimatedMinutes: d.estimatedDecisionMinutes,
      confidence: hasRecommendation
        ? "high"
        : d.alternatives.length > 0
          ? "medium"
          : "low",
      recommendedAction: hasRecommendation
        ? `Recommended: ${d.recommendation}`
        : "Review the alternatives and decide.",
      href: "/decisions",
      priority: d.priority,
      score: PRIORITY_RANK[d.priority] - (unblocks.length > 0 ? 0.5 : 0),
    })
  }

  const assignmentById = new Map(state.workAssignments.map((a) => [a.id, a]))
  for (const del of readyDeliverables(state)) {
    const assignment = assignmentById.get(del.assignmentId)
    const priority = assignment?.priority ?? Priority.Medium
    items.push({
      id: del.id,
      kind: "review",
      title: `Review: ${del.title}`,
      whyItMatters: del.summary,
      estimatedMinutes: 15,
      confidence: "high",
      recommendedAction: "Read the summary, then approve or return for revision.",
      href: `/work/${del.assignmentId}`,
      priority,
      score: PRIORITY_RANK[priority] + 0.25,
    })
  }

  // Blocked work whose unblocking decision is already listed is covered above.
  const listedDecisionAffects = new Set(
    waitingDecisions(state).flatMap((d) => d.affectedAssignmentIds),
  )
  for (const a of blocked) {
    if (listedDecisionAffects.has(a.id)) continue
    items.push({
      id: a.id,
      kind: "blocker",
      title: `Unblock: ${a.title}`,
      whyItMatters: a.blockedReason ?? "This work is stalled.",
      estimatedMinutes: 10,
      confidence: "medium",
      recommendedAction: "Resolve the blocker or redirect the officer.",
      href: `/work/${a.id}`,
      priority: a.priority,
      score: PRIORITY_RANK[a.priority] + 0.1,
    })
  }

  items.sort(
    (a, b) =>
      a.score - b.score ||
      KIND_RANK[a.kind] - KIND_RANK[b.kind] ||
      a.estimatedMinutes - b.estimatedMinutes ||
      a.title.localeCompare(b.title),
  )

  return items.slice(0, limit).map((item) => {
    const { score, ...priority } = item
    void score
    return priority
  })
}

export interface BriefInput {
  periodStart: string
  periodEnd: string
  generatedAt: string
  id: string
}

/**
 * Generate an executive brief from live state. Pure — the caller supplies the
 * period window, generation timestamp, and id.
 */
export function generateBrief(
  state: ConsoleState,
  input: BriefInput,
): ExecutiveBrief {
  const metrics = computeMetrics(state)
  const health = deriveHealth(state)
  const completed = workCompletedSince(state, input.periodStart)
  const blocked = blockedAssignments(state)
  const waiting = waitingDecisions(state)

  const highlights: string[] = []
  for (const a of completed.slice(0, 5)) highlights.push(`Completed: ${a.title}`)
  const readied = readyDeliverables(state)
  for (const d of readied.slice(0, 3))
    highlights.push(`Ready for review: ${d.title}`)

  const risks: string[] = []
  for (const a of blocked)
    risks.push(`${a.title} is blocked${a.blockedReason ? ` — ${a.blockedReason}` : ""}`)
  for (const d of waiting.filter((x) => x.priority === Priority.Critical))
    risks.push(`Critical decision waiting: ${d.title}`)

  const summaryParts = [
    `${metrics.officersActive} officers active`,
    `${metrics.assignmentsInProgress} assignments in progress`,
    `${metrics.workCompletedSinceLastBrief} completed since the last brief`,
  ]
  if (metrics.decisionsWaiting > 0)
    summaryParts.push(`${metrics.decisionsWaiting} decisions await you`)
  if (metrics.blockedAssignments > 0)
    summaryParts.push(`${metrics.blockedAssignments} blocked`)

  return {
    id: input.id,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    summary: summaryParts.join(", ") + ".",
    highlights,
    risks,
    decisionsWaiting: metrics.decisionsWaiting,
    deliverablesReady: metrics.deliverablesReady,
    organizationHealth: health,
    generatedAt: input.generatedAt,
  }
}
