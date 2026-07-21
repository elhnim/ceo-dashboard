/**
 * Founder Console — pure state transitions.
 *
 * Each transition takes a state and returns the next state plus a result. They
 * are pure: callers supply generated ids and timestamps. The service layer
 * wraps these in a repository transaction; the workflow tests exercise them
 * directly.
 */

import {
  ActivityEventType,
  DECISION_ACTION_RESULT,
  DecisionStatus,
  DecisionType,
  Priority,
  RelatedEntityType,
  ReviewStatus,
  WorkAssignmentStatus,
} from "./enums"
import {
  validateDecision,
  validateDeliverable,
  validateWorkAssignment,
  ValidationError,
} from "./validation"
import type {
  ActivityEvent,
  ConsoleState,
  Decision,
  Deliverable,
  WorkAssignment,
} from "@/types/console"
import type { DecisionAction, ReviewStatus as ReviewStatusT } from "./enums"

export class NotFoundError extends Error {
  constructor(entity: string, id: string) {
    super(`${entity} not found: ${id}`)
    this.name = "NotFoundError"
  }
}

interface TxResult<T> {
  state: ConsoleState
  result: T
}

function nextActivityId(state: ConsoleState): string {
  return `ev-${state.activity.length + 1}`
}

function withActivity(
  state: ConsoleState,
  event: Omit<ActivityEvent, "id">,
): ConsoleState {
  const full: ActivityEvent = { id: nextActivityId(state), ...event }
  return { ...state, activity: [...state.activity, full] }
}

// --- Decisions --------------------------------------------------------------

export function resolveDecisionTx(
  state: ConsoleState,
  input: { id: string; action: DecisionAction; rationale?: string; at: string },
): TxResult<Decision> {
  const decision = state.decisions.find((d) => d.id === input.id)
  if (!decision) throw new NotFoundError("Decision", input.id)

  const resolved: Decision = {
    ...decision,
    status: DECISION_ACTION_RESULT[input.action],
    resolution: input.action,
    rationale: input.rationale ?? null,
    decidedAt: input.at,
  }

  let next: ConsoleState = {
    ...state,
    decisions: state.decisions.map((d) => (d.id === resolved.id ? resolved : d)),
  }

  const isConstitutional =
    decision.type === DecisionType.ConstitutionalChange &&
    resolved.status === DecisionStatus.Approved

  next = withActivity(next, {
    eventType: isConstitutional
      ? ActivityEventType.ConstitutionalDecision
      : ActivityEventType.DecisionResolved,
    title: isConstitutional
      ? `Constitutional decision: ${decision.title}`
      : `Decision resolved: ${decision.title}`,
    description: `${input.action}${input.rationale ? ` — ${input.rationale}` : ""}`,
    actorId: "oa-minh",
    relatedEntityType: RelatedEntityType.Decision,
    relatedEntityId: decision.id,
    occurredAt: input.at,
  })

  return { state: next, result: resolved }
}

// --- Deliverables -----------------------------------------------------------

export type DeliverableReviewOutcome = "approve" | "request-revision" | "reject"

const OUTCOME_STATUS: Record<DeliverableReviewOutcome, ReviewStatusT> = {
  approve: ReviewStatus.Approved,
  "request-revision": ReviewStatus.RevisionRequested,
  reject: ReviewStatus.Rejected,
}

export function reviewDeliverableTx(
  state: ConsoleState,
  input: {
    id: string
    outcome: DeliverableReviewOutcome
    comment: string
    author: string
    at: string
  },
): TxResult<Deliverable> {
  const deliverable = state.deliverables.find((d) => d.id === input.id)
  if (!deliverable) throw new NotFoundError("Deliverable", input.id)

  const reviewStatus = OUTCOME_STATUS[input.outcome]
  const updated: Deliverable = {
    ...deliverable,
    reviewStatus,
    reviewedAt: input.at,
    reviewComments: [
      ...deliverable.reviewComments,
      { at: input.at, author: input.author, comment: input.comment, outcome: reviewStatus },
    ],
  }

  // Reflect the review on the linked assignment.
  const workAssignments = state.workAssignments.map((a) => {
    if (a.id !== deliverable.assignmentId) return a
    if (input.outcome === "approve" && a.status === WorkAssignmentStatus.Review)
      return { ...a, status: WorkAssignmentStatus.Approved, updatedAt: input.at }
    if (input.outcome === "request-revision")
      return { ...a, status: WorkAssignmentStatus.InProgress, updatedAt: input.at }
    return a
  })

  let next: ConsoleState = {
    ...state,
    deliverables: state.deliverables.map((d) => (d.id === updated.id ? updated : d)),
    workAssignments,
  }

  next = withActivity(next, {
    eventType:
      input.outcome === "approve"
        ? ActivityEventType.DeliverableApproved
        : ActivityEventType.DeliverableReturned,
    title:
      input.outcome === "approve"
        ? `Deliverable approved: ${deliverable.title}`
        : `Deliverable returned: ${deliverable.title}`,
    description: input.comment,
    actorId: "oa-minh",
    relatedEntityType: RelatedEntityType.Deliverable,
    relatedEntityId: deliverable.id,
    occurredAt: input.at,
  })

  return { state: next, result: updated }
}

// --- Work assignments -------------------------------------------------------

export interface NewWorkAssignmentInput {
  title: string
  objective: string
  description?: string
  ownerOfficerAssignmentId: string
  collaboratorIds?: string[]
  priority?: Priority
  acceptanceCriteria?: string[]
  dependencyIds?: string[]
  dueDate?: string | null
  createdBy?: string
}

export function createWorkAssignmentTx(
  state: ConsoleState,
  input: { data: NewWorkAssignmentInput; id: string; at: string },
): TxResult<WorkAssignment> {
  const issues = validateWorkAssignment(input.data)
  if (issues.length > 0) throw new ValidationError(issues)

  if (!state.officerAssignments.some((o) => o.id === input.data.ownerOfficerAssignmentId))
    throw new NotFoundError("OfficerAssignment", input.data.ownerOfficerAssignmentId)

  const assignment: WorkAssignment = {
    id: input.id,
    title: input.data.title,
    objective: input.data.objective,
    description: input.data.description ?? "",
    ownerOfficerAssignmentId: input.data.ownerOfficerAssignmentId,
    collaboratorIds: input.data.collaboratorIds ?? [],
    priority: input.data.priority ?? Priority.Medium,
    status: WorkAssignmentStatus.Proposed,
    dueDate: input.data.dueDate ?? null,
    acceptanceCriteria: input.data.acceptanceCriteria ?? [],
    dependencyIds: input.data.dependencyIds ?? [],
    linkedOutcomeIds: [],
    blockedReason: null,
    progress: [],
    createdBy: input.data.createdBy ?? "oa-ea",
    createdAt: input.at,
    updatedAt: input.at,
  }

  let next: ConsoleState = {
    ...state,
    workAssignments: [...state.workAssignments, assignment],
  }
  next = withActivity(next, {
    eventType: ActivityEventType.AssignmentCreated,
    title: `Assignment created: ${assignment.title}`,
    description: assignment.objective,
    actorId: assignment.createdBy,
    relatedEntityType: RelatedEntityType.WorkAssignment,
    relatedEntityId: assignment.id,
    occurredAt: input.at,
  })

  return { state: next, result: assignment }
}

export function setWorkStatusTx(
  state: ConsoleState,
  input: {
    id: string
    status: WorkAssignment["status"]
    reason?: string
    note?: string
    at: string
  },
): TxResult<WorkAssignment> {
  const existing = state.workAssignments.find((a) => a.id === input.id)
  if (!existing) throw new NotFoundError("WorkAssignment", input.id)

  const issues = validateWorkAssignment({
    ...existing,
    status: input.status,
    blockedReason:
      input.status === WorkAssignmentStatus.Blocked ? input.reason ?? "" : null,
  })
  if (issues.length > 0) throw new ValidationError(issues)

  const wasBlocked = existing.status === WorkAssignmentStatus.Blocked
  const nowBlocked = input.status === WorkAssignmentStatus.Blocked

  const updated: WorkAssignment = {
    ...existing,
    status: input.status,
    blockedReason: nowBlocked ? input.reason ?? existing.blockedReason : null,
    progress: input.note
      ? [...existing.progress, { at: input.at, note: input.note }]
      : existing.progress,
    updatedAt: input.at,
  }

  let next: ConsoleState = {
    ...state,
    workAssignments: state.workAssignments.map((a) =>
      a.id === updated.id ? updated : a,
    ),
  }

  let eventType: ActivityEventType | null = null
  let title = ""
  if (nowBlocked && !wasBlocked) {
    eventType = ActivityEventType.OfficerBlocked
    title = `Blocked: ${existing.title}`
  } else if (!nowBlocked && wasBlocked) {
    eventType = ActivityEventType.OfficerUnblocked
    title = `Unblocked: ${existing.title}`
  } else if (input.status === WorkAssignmentStatus.InProgress && !wasBlocked) {
    eventType = ActivityEventType.WorkStarted
    title = `Work started: ${existing.title}`
  }

  if (eventType) {
    next = withActivity(next, {
      eventType,
      title,
      description: input.reason ?? input.note ?? "",
      actorId: existing.ownerOfficerAssignmentId,
      relatedEntityType: RelatedEntityType.WorkAssignment,
      relatedEntityId: existing.id,
      occurredAt: input.at,
    })
  }

  return { state: next, result: updated }
}

// --- Deliverable creation (used by future agent submissions) ----------------

export function createDeliverableTx(
  state: ConsoleState,
  input: {
    data: Partial<Deliverable> & { assignmentId: string; title: string }
    id: string
    at: string
  },
): TxResult<Deliverable> {
  const issues = validateDeliverable(input.data)
  if (issues.length > 0) throw new ValidationError(issues)
  const deliverable: Deliverable = {
    id: input.id,
    assignmentId: input.data.assignmentId,
    title: input.data.title,
    type: input.data.type!,
    version: input.data.version ?? 1,
    summary: input.data.summary ?? "",
    content: input.data.content ?? "",
    authorOfficerAssignmentId: input.data.authorOfficerAssignmentId ?? "oa-ea",
    reviewStatus: input.data.reviewStatus ?? ReviewStatus.Submitted,
    reviewComments: [],
    supportingEvidence: input.data.supportingEvidence ?? [],
    createdAt: input.at,
    reviewedAt: null,
  }
  let next: ConsoleState = {
    ...state,
    deliverables: [...state.deliverables, deliverable],
  }
  next = withActivity(next, {
    eventType: ActivityEventType.DeliverableSubmitted,
    title: `Deliverable submitted: ${deliverable.title}`,
    description: deliverable.summary,
    actorId: deliverable.authorOfficerAssignmentId,
    relatedEntityType: RelatedEntityType.Deliverable,
    relatedEntityId: deliverable.id,
    occurredAt: input.at,
  })
  return { state: next, result: deliverable }
}

// --- Conversation / brief ---------------------------------------------------

export function appendConversationTx(
  state: ConsoleState,
  input: {
    directorText: string
    eaText: string
    directorId: string
    eaId: string
    at: string
  },
): TxResult<ConsoleState["conversation"]> {
  const conversation = [
    ...state.conversation,
    { id: input.directorId, role: "director" as const, text: input.directorText, at: input.at },
    { id: input.eaId, role: "ea" as const, text: input.eaText, at: input.at },
  ]
  const next = { ...state, conversation }
  return { state: next, result: conversation }
}

export function decisionActionValidate(input: Partial<Decision>): string[] {
  return validateDecision(input)
}
