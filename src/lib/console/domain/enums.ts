/**
 * Founder Console — canonical enumerations.
 *
 * These are modelled as `as const` objects (not TS `enum`) so they are safe
 * under native TypeScript type-stripping (Node's built-in test runner) and
 * tree-shake cleanly in the bundler. Each object is paired with a derived
 * union type and a human-facing label map used across the executive UI.
 */

export const OrganizationHealth = {
  Healthy: "healthy",
  AttentionRequired: "attention-required",
  Critical: "critical",
} as const
export type OrganizationHealth =
  (typeof OrganizationHealth)[keyof typeof OrganizationHealth]

export const OrganizationHealthLabel: Record<OrganizationHealth, string> = {
  healthy: "Healthy",
  "attention-required": "Attention required",
  critical: "Critical",
}

export const PersonType = {
  Human: "human",
  AiOfficer: "ai-officer",
  AiWorker: "ai-worker",
  External: "external",
} as const
export type PersonType = (typeof PersonType)[keyof typeof PersonType]

export const RoleStatus = {
  Active: "active",
  Temporary: "temporary",
  Retired: "retired",
} as const
export type RoleStatus = (typeof RoleStatus)[keyof typeof RoleStatus]

export const RoleStatusLabel: Record<RoleStatus, string> = {
  active: "Active",
  temporary: "Temporary founding role",
  retired: "Retired",
}

export const OfficerAssignmentStatus = {
  Active: "active",
  Suspended: "suspended",
  Ended: "ended",
} as const
export type OfficerAssignmentStatus =
  (typeof OfficerAssignmentStatus)[keyof typeof OfficerAssignmentStatus]

export const ProbationStatus = {
  Founding: "founding",
  Probationary: "probationary",
  Confirmed: "confirmed",
} as const
export type ProbationStatus =
  (typeof ProbationStatus)[keyof typeof ProbationStatus]

export const WorkAssignmentStatus = {
  Proposed: "proposed",
  Ready: "ready",
  InProgress: "in-progress",
  Blocked: "blocked",
  Review: "review",
  Approved: "approved",
  Completed: "completed",
  Cancelled: "cancelled",
} as const
export type WorkAssignmentStatus =
  (typeof WorkAssignmentStatus)[keyof typeof WorkAssignmentStatus]

export const WORK_ASSIGNMENT_STATUS_ORDER: WorkAssignmentStatus[] = [
  WorkAssignmentStatus.Proposed,
  WorkAssignmentStatus.Ready,
  WorkAssignmentStatus.InProgress,
  WorkAssignmentStatus.Blocked,
  WorkAssignmentStatus.Review,
  WorkAssignmentStatus.Approved,
  WorkAssignmentStatus.Completed,
  WorkAssignmentStatus.Cancelled,
]

export const WorkAssignmentStatusLabel: Record<WorkAssignmentStatus, string> = {
  proposed: "Proposed",
  ready: "Ready",
  "in-progress": "In progress",
  blocked: "Blocked",
  review: "Review",
  approved: "Approved",
  completed: "Completed",
  cancelled: "Cancelled",
}

/** Statuses that count as "actively being worked" for executive metrics. */
export const ACTIVE_WORK_STATUSES: WorkAssignmentStatus[] = [
  WorkAssignmentStatus.Ready,
  WorkAssignmentStatus.InProgress,
  WorkAssignmentStatus.Review,
]

export const Priority = {
  Critical: "critical",
  High: "high",
  Medium: "medium",
  Low: "low",
} as const
export type Priority = (typeof Priority)[keyof typeof Priority]

export const PRIORITY_ORDER: Priority[] = [
  Priority.Critical,
  Priority.High,
  Priority.Medium,
  Priority.Low,
]

/** Lower rank = more urgent. Used to sort decision and work queues. */
export const PRIORITY_RANK: Record<Priority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
}

export const PriorityLabel: Record<Priority, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
}

export const DeliverableType = {
  Proposal: "proposal",
  Specification: "specification",
  OutcomeMap: "outcome-map",
  Model: "model",
  Research: "research",
  Recommendation: "recommendation",
  Charter: "charter",
  Report: "report",
  Design: "design",
  Plan: "plan",
} as const
export type DeliverableType =
  (typeof DeliverableType)[keyof typeof DeliverableType]

export const DeliverableTypeLabel: Record<DeliverableType, string> = {
  proposal: "Proposal",
  specification: "Specification",
  "outcome-map": "Outcome map",
  model: "Model",
  research: "Research",
  recommendation: "Recommendation",
  charter: "Charter",
  report: "Report",
  design: "Design",
  plan: "Plan",
}

export const ReviewStatus = {
  Draft: "draft",
  Submitted: "submitted",
  Approved: "approved",
  RevisionRequested: "revision-requested",
  Rejected: "rejected",
} as const
export type ReviewStatus = (typeof ReviewStatus)[keyof typeof ReviewStatus]

export const ReviewStatusLabel: Record<ReviewStatus, string> = {
  draft: "Draft",
  submitted: "Awaiting review",
  approved: "Approved",
  "revision-requested": "Revision requested",
  rejected: "Rejected",
}

export const DecisionType = {
  Approval: "approval",
  Question: "question",
  Permission: "permission",
  Risk: "risk",
  Review: "review",
  Priority: "priority",
  Exception: "exception",
  ConstitutionalChange: "constitutional-change",
} as const
export type DecisionType = (typeof DecisionType)[keyof typeof DecisionType]

export const DecisionTypeLabel: Record<DecisionType, string> = {
  approval: "Approval",
  question: "Question",
  permission: "Permission",
  risk: "Risk",
  review: "Review",
  priority: "Priority",
  exception: "Exception",
  "constitutional-change": "Constitutional change",
}

export const DecisionStatus = {
  Waiting: "waiting",
  Approved: "approved",
  Rejected: "rejected",
  Modified: "modified",
  Delegated: "delegated",
  Deferred: "deferred",
  Discussing: "discussing",
} as const
export type DecisionStatus =
  (typeof DecisionStatus)[keyof typeof DecisionStatus]

export const DecisionStatusLabel: Record<DecisionStatus, string> = {
  waiting: "Waiting",
  approved: "Approved",
  rejected: "Rejected",
  modified: "Modified & approved",
  delegated: "Delegated",
  deferred: "Deferred",
  discussing: "In discussion",
}

/** Actions the Product Director can take on a decision. */
export const DecisionAction = {
  Approve: "approve",
  Reject: "reject",
  Modify: "modify",
  Discuss: "discuss",
  Delegate: "delegate",
  Defer: "defer",
} as const
export type DecisionAction =
  (typeof DecisionAction)[keyof typeof DecisionAction]

export const DecisionActionLabel: Record<DecisionAction, string> = {
  approve: "Approve",
  reject: "Reject",
  modify: "Modify",
  discuss: "Discuss",
  delegate: "Delegate",
  defer: "Defer",
}

/** Maps a resolution action to the status it produces. */
export const DECISION_ACTION_RESULT: Record<DecisionAction, DecisionStatus> = {
  approve: DecisionStatus.Approved,
  reject: DecisionStatus.Rejected,
  modify: DecisionStatus.Modified,
  discuss: DecisionStatus.Discussing,
  delegate: DecisionStatus.Delegated,
  defer: DecisionStatus.Deferred,
}

/** Confidence in a commitment or recommendation, deterministic — no AI scoring. */
export const ConfidenceLevel = {
  High: "high",
  Medium: "medium",
  Low: "low",
} as const
export type ConfidenceLevel =
  (typeof ConfidenceLevel)[keyof typeof ConfidenceLevel]

export const ConfidenceLevelLabel: Record<ConfidenceLevel, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
}

/** Numeric weight used to average confidence across commitments (3 = high). */
export const CONFIDENCE_WEIGHT: Record<ConfidenceLevel, number> = {
  high: 3,
  medium: 2,
  low: 1,
}

/**
 * Commitment lifecycle. A Commitment is a promise by an officer to deliver an
 * outcome — not a task. Draft → Committed → In progress → (Blocked ⇄) →
 * Completed → Verified.
 */
export const CommitmentStatus = {
  Draft: "draft",
  Committed: "committed",
  InProgress: "in-progress",
  Blocked: "blocked",
  Completed: "completed",
  Verified: "verified",
} as const
export type CommitmentStatus =
  (typeof CommitmentStatus)[keyof typeof CommitmentStatus]

export const COMMITMENT_STATUS_ORDER: CommitmentStatus[] = [
  CommitmentStatus.Draft,
  CommitmentStatus.Committed,
  CommitmentStatus.InProgress,
  CommitmentStatus.Blocked,
  CommitmentStatus.Completed,
  CommitmentStatus.Verified,
]

export const CommitmentStatusLabel: Record<CommitmentStatus, string> = {
  draft: "Draft",
  committed: "Committed",
  "in-progress": "In progress",
  blocked: "Blocked",
  completed: "Completed",
  verified: "Verified",
}

/** Statuses that count as an open, active promise. */
export const ACTIVE_COMMITMENT_STATUSES: CommitmentStatus[] = [
  CommitmentStatus.Committed,
  CommitmentStatus.InProgress,
  CommitmentStatus.Blocked,
]

/**
 * Legal lifecycle transitions. Blocked is a detour from In progress; Verified
 * is terminal. Anything not listed is rejected by the transition layer.
 */
export const COMMITMENT_TRANSITIONS: Record<CommitmentStatus, CommitmentStatus[]> = {
  draft: [CommitmentStatus.Committed],
  committed: [CommitmentStatus.InProgress, CommitmentStatus.Blocked],
  "in-progress": [CommitmentStatus.Blocked, CommitmentStatus.Completed],
  blocked: [CommitmentStatus.InProgress, CommitmentStatus.Completed],
  completed: [CommitmentStatus.Verified],
  verified: [],
}

/**
 * Decision workflow stage — the decision's position in its lifecycle, distinct
 * from `status`, which records how the Director resolved it. Draft →
 * Needs review → Ready → Approved → Executed → Verified.
 */
export const DecisionStage = {
  Draft: "draft",
  NeedsReview: "needs-review",
  Ready: "ready",
  Approved: "approved",
  Executed: "executed",
  Verified: "verified",
} as const
export type DecisionStage = (typeof DecisionStage)[keyof typeof DecisionStage]

export const DECISION_STAGE_ORDER: DecisionStage[] = [
  DecisionStage.Draft,
  DecisionStage.NeedsReview,
  DecisionStage.Ready,
  DecisionStage.Approved,
  DecisionStage.Executed,
  DecisionStage.Verified,
]

export const DecisionStageLabel: Record<DecisionStage, string> = {
  draft: "Draft",
  "needs-review": "Needs review",
  ready: "Ready",
  approved: "Approved",
  executed: "Executed",
  verified: "Verified",
}

export const DECISION_STAGE_TRANSITIONS: Record<DecisionStage, DecisionStage[]> = {
  draft: [DecisionStage.NeedsReview],
  "needs-review": [DecisionStage.Ready],
  ready: [DecisionStage.Approved],
  approved: [DecisionStage.Executed],
  executed: [DecisionStage.Verified],
  verified: [],
}

export const ActivityEventType = {
  AssignmentCreated: "assignment-created",
  AssignmentDelegated: "assignment-delegated",
  WorkStarted: "work-started",
  QuestionRaised: "question-raised",
  DecisionRequested: "decision-requested",
  DecisionResolved: "decision-resolved",
  DeliverableSubmitted: "deliverable-submitted",
  DeliverableApproved: "deliverable-approved",
  DeliverableReturned: "deliverable-returned",
  OfficerBlocked: "officer-blocked",
  OfficerUnblocked: "officer-unblocked",
  ConstitutionalDecision: "constitutional-decision",
  CommitmentCreated: "commitment-created",
  CommitmentCompleted: "commitment-completed",
  CommitmentVerified: "commitment-verified",
  CommitmentBlocked: "commitment-blocked",
  CommitmentUnblocked: "commitment-unblocked",
} as const
export type ActivityEventType =
  (typeof ActivityEventType)[keyof typeof ActivityEventType]

export const ActivityEventTypeLabel: Record<ActivityEventType, string> = {
  "assignment-created": "Assignment created",
  "assignment-delegated": "Assignment delegated",
  "work-started": "Work started",
  "question-raised": "Question raised",
  "decision-requested": "Decision requested",
  "decision-resolved": "Decision resolved",
  "deliverable-submitted": "Deliverable submitted",
  "deliverable-approved": "Deliverable approved",
  "deliverable-returned": "Deliverable returned for revision",
  "officer-blocked": "Officer blocked",
  "officer-unblocked": "Officer unblocked",
  "constitutional-decision": "Constitutional decision recorded",
  "commitment-created": "Commitment created",
  "commitment-completed": "Commitment completed",
  "commitment-verified": "Commitment verified",
  "commitment-blocked": "Commitment blocked",
  "commitment-unblocked": "Commitment unblocked",
}

export const RelatedEntityType = {
  Organization: "organization",
  Person: "person",
  Role: "role",
  OfficerAssignment: "officer-assignment",
  WorkAssignment: "work-assignment",
  Deliverable: "deliverable",
  Decision: "decision",
  Commitment: "commitment",
} as const
export type RelatedEntityType =
  (typeof RelatedEntityType)[keyof typeof RelatedEntityType]

/** Utility: list the string values of an `as const` enum object. */
export function enumValues<T extends Record<string, string>>(
  source: T,
): T[keyof T][] {
  return Object.values(source) as T[keyof T][]
}
