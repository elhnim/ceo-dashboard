/**
 * Founder Console — pure derivation logic.
 *
 * All functions here are pure (no I/O, no clock reads via arguments only) so
 * they are trivially unit-testable and reusable on server, client, and a
 * future iOS target. The executive UI reads exclusively through these.
 */

import {
  ACTIVE_COMMITMENT_STATUSES,
  ACTIVE_WORK_STATUSES,
  CONFIDENCE_WEIGHT,
  CommitmentStatus,
  ConfidenceLevel,
  DecisionStage,
  DecisionStatus,
  OrganizationHealth,
  PRIORITY_RANK,
  Priority,
  ReviewStatus,
  WorkAssignmentStatus,
} from "./enums"
import type {
  ActivityEvent,
  Commitment,
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

// --- Commitments (Milestone 2) ----------------------------------------------

/** Open, active promises: committed, in progress, or blocked. */
export function activeCommitments(state: ConsoleState): Commitment[] {
  return state.commitments.filter((c) =>
    ACTIVE_COMMITMENT_STATUSES.includes(c.status),
  )
}

/**
 * A due date means "by the end of that day" — something due 21 July is on
 * time at 16:00 on the 21st and overdue from the 22nd.
 */
export function endOfDueDay(dueDate: string): string {
  return `${dueDate.slice(0, 10)}T23:59:59.999Z`
}

/** Is this commitment past due and not yet delivered? */
export function isOverdue(commitment: Commitment, now: string): boolean {
  if (!commitment.dueDate) return false
  if (
    commitment.status === CommitmentStatus.Completed ||
    commitment.status === CommitmentStatus.Verified
  )
    return false
  return endOfDueDay(commitment.dueDate) < now
}

export function overdueCommitments(state: ConsoleState, now: string): Commitment[] {
  return state.commitments.filter((c) => isOverdue(c, now))
}

/** Completed commitments waiting for the Director's verification. */
export function awaitingVerification(state: ConsoleState): Commitment[] {
  return state.commitments.filter((c) => c.status === CommitmentStatus.Completed)
}

export interface OfficerCommitments {
  active: Commitment[]
  completed: Commitment[]
  blocked: Commitment[]
  overdue: Commitment[]
  drafts: Commitment[]
}

export function commitmentsForOfficer(
  state: ConsoleState,
  officerAssignmentId: string,
  now: string,
): OfficerCommitments {
  const own = state.commitments.filter(
    (c) => c.ownerOfficerAssignmentId === officerAssignmentId,
  )
  return {
    active: own.filter((c) => ACTIVE_COMMITMENT_STATUSES.includes(c.status)),
    completed: own.filter(
      (c) =>
        c.status === CommitmentStatus.Completed ||
        c.status === CommitmentStatus.Verified,
    ),
    blocked: own.filter((c) => c.status === CommitmentStatus.Blocked),
    overdue: own.filter((c) => isOverdue(c, now)),
    drafts: own.filter((c) => c.status === CommitmentStatus.Draft),
  }
}

/**
 * Current workload: open commitments plus active work assignments owned by the
 * officer. Purely observable — used for the overload signal.
 */
export function officerWorkload(
  state: ConsoleState,
  officerAssignmentId: string,
): number {
  const commitments = state.commitments.filter(
    (c) =>
      c.ownerOfficerAssignmentId === officerAssignmentId &&
      ACTIVE_COMMITMENT_STATUSES.includes(c.status),
  ).length
  const assignments = state.workAssignments.filter(
    (a) =>
      a.ownerOfficerAssignmentId === officerAssignmentId &&
      (ACTIVE_WORK_STATUSES.includes(a.status) ||
        a.status === WorkAssignmentStatus.Blocked),
  ).length
  return commitments + assignments
}

/** An officer carrying this many open items is flagged as overloaded. */
export const OVERLOAD_THRESHOLD = 5

/**
 * Mean confidence across an officer's active commitments, as a level plus the
 * numeric mean (1–3). Null when the officer has no active commitments.
 */
export function averageConfidence(
  state: ConsoleState,
  officerAssignmentId: string,
): { level: ConfidenceLevel; mean: number; sample: number } | null {
  const own = state.commitments.filter(
    (c) =>
      c.ownerOfficerAssignmentId === officerAssignmentId &&
      ACTIVE_COMMITMENT_STATUSES.includes(c.status),
  )
  if (own.length === 0) return null
  const mean =
    own.reduce((sum, c) => sum + CONFIDENCE_WEIGHT[c.confidence], 0) / own.length
  const level: ConfidenceLevel =
    mean >= 2.5
      ? ConfidenceLevel.High
      : mean >= 1.5
        ? ConfidenceLevel.Medium
        : ConfidenceLevel.Low
  return { level, mean: Math.round(mean * 10) / 10, sample: own.length }
}

/**
 * Delivery score — observable data only, no AI scoring. The share of concluded
 * commitments (completed or verified) delivered on or before their due date;
 * commitments without a due date count as on time. Null until the officer has
 * concluded at least one commitment.
 */
export function deliveryScore(
  state: ConsoleState,
  officerAssignmentId: string,
): { score: number; concluded: number; onTime: number } | null {
  const concluded = state.commitments.filter(
    (c) =>
      c.ownerOfficerAssignmentId === officerAssignmentId &&
      (c.status === CommitmentStatus.Completed ||
        c.status === CommitmentStatus.Verified) &&
      c.completedAt !== null,
  )
  if (concluded.length === 0) return null
  const onTime = concluded.filter(
    (c) =>
      !c.dueDate ||
      (c.completedAt !== null && c.completedAt <= endOfDueDay(c.dueDate)),
  ).length
  return {
    score: Math.round((onTime / concluded.length) * 100),
    concluded: concluded.length,
    onTime,
  }
}

// --- Executive Brief 2.0 (Milestone 2) ---------------------------------------

/**
 * Focus Today: the highest-value open commitments — blocked first (they need
 * intervention), then overdue, then by nearest due date.
 */
export function focusToday(state: ConsoleState, now: string, limit = 4): Commitment[] {
  const rank = (c: Commitment) => {
    if (c.status === CommitmentStatus.Blocked) return 0
    if (isOverdue(c, now)) return 1
    return 2
  }
  return [...activeCommitments(state)]
    .sort(
      (a, b) =>
        rank(a) - rank(b) ||
        (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999") ||
        a.title.localeCompare(b.title),
    )
    .slice(0, limit)
}

export interface WaitingItem {
  kind: "decision" | "deliverable" | "verification"
  id: string
  title: string
  detail: string
  href: string
}

/** Everything currently requiring the Director's attention, in one list. */
export function waitingForMe(state: ConsoleState): WaitingItem[] {
  const items: WaitingItem[] = []
  for (const d of waitingDecisions(state)) {
    items.push({
      kind: "decision",
      id: d.id,
      title: d.title,
      detail: `Decision · ~${d.estimatedDecisionMinutes} min`,
      href: "/decisions",
    })
  }
  for (const del of readyDeliverables(state)) {
    items.push({
      kind: "deliverable",
      id: del.id,
      title: del.title,
      detail: "Deliverable awaiting review",
      href: `/work/${del.assignmentId}`,
    })
  }
  for (const c of awaitingVerification(state)) {
    items.push({
      kind: "verification",
      id: c.id,
      title: c.title,
      detail: "Commitment delivered — verify the outcome",
      href: `/commitments/${c.id}`,
    })
  }
  return items
}

export interface EmergingRisk {
  kind: "overdue-commitment" | "overloaded-officer" | "delayed-decision" | "blocked-commitment"
  title: string
  detail: string
  href: string
}

/** Deterministic risk signals from observable state. */
export function emergingRisks(state: ConsoleState, now: string): EmergingRisk[] {
  const risks: EmergingRisk[] = []

  for (const c of overdueCommitments(state, now)) {
    risks.push({
      kind: "overdue-commitment",
      title: `Overdue: ${c.title}`,
      detail: `Due ${c.dueDate!.slice(0, 10)} · owned by ${ownerNameOf(state, c.ownerOfficerAssignmentId)}`,
      href: `/commitments/${c.id}`,
    })
  }

  for (const c of state.commitments.filter((x) => x.status === CommitmentStatus.Blocked)) {
    risks.push({
      kind: "blocked-commitment",
      title: `Blocked: ${c.title}`,
      detail: c.blockedReason ?? "No reason recorded",
      href: `/commitments/${c.id}`,
    })
  }

  for (const officer of state.officerAssignments) {
    const load = officerWorkload(state, officer.id)
    if (load >= OVERLOAD_THRESHOLD) {
      risks.push({
        kind: "overloaded-officer",
        title: `${ownerNameOf(state, officer.id)} is carrying ${load} open items`,
        detail: "Consider re-sequencing or re-delegating.",
        href: `/organization/${officer.id}`,
      })
    }
  }

  for (const d of state.decisions) {
    const open =
      d.status === DecisionStatus.Waiting ||
      d.stage === DecisionStage.Draft ||
      d.stage === DecisionStage.NeedsReview ||
      d.stage === DecisionStage.Ready
    if (open && d.dueDate && endOfDueDay(d.dueDate) < now) {
      risks.push({
        kind: "delayed-decision",
        title: `Decision past due: ${d.title}`,
        detail: `Due ${d.dueDate.slice(0, 10)} · ~${d.estimatedDecisionMinutes} min to decide`,
        href: "/decisions",
      })
    }
  }

  return risks
}

function ownerNameOf(state: ConsoleState, officerAssignmentId: string): string {
  const oa = state.officerAssignments.find((o) => o.id === officerAssignmentId)
  const person = oa ? state.people.find((p) => p.id === oa.personId) : undefined
  return person?.name ?? "an officer"
}

export interface Momentum {
  commitmentsCompleted: number
  commitmentsVerified: number
  decisionsResolved: number
  deliverablesApproved: number
  workCompleted: number
}

/** Organizational progress since a point in time (usually the last brief). */
export function momentum(state: ConsoleState, since: string | null): Momentum {
  const after = (at: string | null) => (since ? at !== null && at > since : at !== null)
  return {
    commitmentsCompleted: state.commitments.filter((c) => after(c.completedAt)).length,
    commitmentsVerified: state.commitments.filter((c) => after(c.verifiedAt)).length,
    decisionsResolved: state.decisions.filter((d) => after(d.decidedAt)).length,
    deliverablesApproved: state.deliverables.filter(
      (d) => d.reviewStatus === ReviewStatus.Approved && after(d.reviewedAt),
    ).length,
    workCompleted: workCompletedSince(state, since).length,
  }
}

/**
 * Organization health as a traffic light. Green when nothing needs attention,
 * yellow when anything waits/blocks/overdue, red when a critical-priority item
 * is stuck. Wraps deriveHealth and adds commitment signals when `now` is given.
 */
export function healthSignal(
  state: ConsoleState,
  now?: string,
): { health: OrganizationHealth; color: "green" | "yellow" | "red" } {
  let health = deriveHealth(state)
  if (now && health === OrganizationHealth.Healthy) {
    const overdue = overdueCommitments(state, now)
    const blocked = state.commitments.some((c) => c.status === CommitmentStatus.Blocked)
    if (overdue.length > 0 || blocked || awaitingVerification(state).length > 0)
      health = OrganizationHealth.AttentionRequired
  }
  const color =
    health === OrganizationHealth.Healthy
      ? "green"
      : health === OrganizationHealth.AttentionRequired
        ? "yellow"
        : "red"
  return { health, color }
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
