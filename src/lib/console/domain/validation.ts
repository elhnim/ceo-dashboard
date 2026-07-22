/**
 * Founder Console — validation.
 *
 * Two layers:
 *  - field validators (`validateDecision`, `validateWorkAssignment`, ...) used
 *    when accepting mutations from the API/UI;
 *  - `validateConsoleState`, a referential-integrity check used by the seed
 *    integrity tests and on repository load.
 *
 * Runtime enum objects are imported relatively so this module runs under
 * Node's native type-stripping test runner without a bundler.
 */

import {
  CommitmentStatus,
  ConfidenceLevel,
  DecisionStage,
  DecisionStatus,
  DecisionType,
  DeliverableType,
  enumValues,
  OfficerAssignmentStatus,
  OrganizationHealth,
  PersonType,
  Priority,
  ProbationStatus,
  RelatedEntityType,
  ReviewStatus,
  RoleStatus,
  WorkAssignmentStatus,
  ActivityEventType,
} from "./enums"
import type {
  Commitment,
  ConsoleState,
  Decision,
  Deliverable,
  WorkAssignment,
} from "@/types/console"

export class ValidationError extends Error {
  readonly issues: string[]
  constructor(issues: string[]) {
    super(`Validation failed: ${issues.join("; ")}`)
    this.name = "ValidationError"
    this.issues = issues
  }
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

function isOneOf<T extends string>(value: unknown, allowed: T[]): value is T {
  return typeof value === "string" && (allowed as string[]).includes(value)
}

/**
 * Validate a partial WorkAssignment payload (create/update). Returns the list
 * of issues; empty means valid.
 */
export function validateWorkAssignment(
  input: Partial<WorkAssignment>,
): string[] {
  const issues: string[] = []
  if (!isNonEmptyString(input.title)) issues.push("title is required")
  if (!isNonEmptyString(input.objective)) issues.push("objective is required")
  if (!isNonEmptyString(input.ownerOfficerAssignmentId))
    issues.push("ownerOfficerAssignmentId is required")
  if (
    input.priority !== undefined &&
    !isOneOf(input.priority, enumValues(Priority))
  )
    issues.push(`priority must be one of ${enumValues(Priority).join(", ")}`)
  if (
    input.status !== undefined &&
    !isOneOf(input.status, enumValues(WorkAssignmentStatus))
  )
    issues.push("status is not a valid work status")
  if (
    input.status === WorkAssignmentStatus.Blocked &&
    !isNonEmptyString(input.blockedReason)
  )
    issues.push("blockedReason is required when status is blocked")
  return issues
}

export function validateDecision(input: Partial<Decision>): string[] {
  const issues: string[] = []
  if (!isNonEmptyString(input.title)) issues.push("title is required")
  if (!isOneOf(input.type, enumValues(DecisionType)))
    issues.push("type is not a valid decision type")
  if (!isOneOf(input.priority, enumValues(Priority)))
    issues.push("priority is not valid")
  if (!isNonEmptyString(input.whyItMatters))
    issues.push("whyItMatters is required")
  if (
    input.estimatedDecisionMinutes !== undefined &&
    (typeof input.estimatedDecisionMinutes !== "number" ||
      input.estimatedDecisionMinutes < 0)
  )
    issues.push("estimatedDecisionMinutes must be a non-negative number")
  return issues
}

/**
 * Validate a partial Commitment payload (create/update). A commitment must
 * always have an owner — that invariant is enforced here and in transitions.
 */
export function validateCommitment(input: Partial<Commitment>): string[] {
  const issues: string[] = []
  if (!isNonEmptyString(input.title)) issues.push("title is required")
  if (!isNonEmptyString(input.outcome)) issues.push("outcome is required")
  if (!isNonEmptyString(input.ownerOfficerAssignmentId))
    issues.push("ownerOfficerAssignmentId is required — every commitment has an owner")
  if (
    input.status !== undefined &&
    !isOneOf(input.status, enumValues(CommitmentStatus))
  )
    issues.push("status is not a valid commitment status")
  if (
    input.confidence !== undefined &&
    !isOneOf(input.confidence, enumValues(ConfidenceLevel))
  )
    issues.push(`confidence must be one of ${enumValues(ConfidenceLevel).join(", ")}`)
  if (
    input.status === CommitmentStatus.Blocked &&
    !isNonEmptyString(input.blockedReason)
  )
    issues.push("blockedReason is required when status is blocked")
  return issues
}

export function validateDeliverable(input: Partial<Deliverable>): string[] {
  const issues: string[] = []
  if (!isNonEmptyString(input.title)) issues.push("title is required")
  if (!isOneOf(input.type, enumValues(DeliverableType)))
    issues.push("type is not a valid deliverable type")
  if (!isNonEmptyString(input.assignmentId))
    issues.push("assignmentId is required")
  if (
    input.version !== undefined &&
    (typeof input.version !== "number" || input.version < 1)
  )
    issues.push("version must be a positive integer")
  if (
    input.reviewStatus !== undefined &&
    !isOneOf(input.reviewStatus, enumValues(ReviewStatus))
  )
    issues.push("reviewStatus is not valid")
  return issues
}

/**
 * Full referential-integrity check of a ConsoleState. Verifies that every
 * enum value is legal and every foreign-key reference resolves.
 */
export function validateConsoleState(state: ConsoleState): string[] {
  const issues: string[] = []

  const personIds = new Set(state.people.map((p) => p.id))
  const roleIds = new Set(state.roles.map((r) => r.id))
  const officerIds = new Set(state.officerAssignments.map((o) => o.id))
  const assignmentIds = new Set(state.workAssignments.map((a) => a.id))

  if (!isOneOf(state.organization.status, enumValues(OrganizationHealth)))
    issues.push("organization.status is not a valid health value")

  for (const p of state.people) {
    if (!isOneOf(p.personType, enumValues(PersonType)))
      issues.push(`person ${p.id}: invalid personType`)
  }

  for (const r of state.roles) {
    if (!isOneOf(r.status, enumValues(RoleStatus)))
      issues.push(`role ${r.id}: invalid status`)
    if (r.reportsToRoleId !== null && !roleIds.has(r.reportsToRoleId))
      issues.push(`role ${r.id}: reportsToRoleId ${r.reportsToRoleId} missing`)
  }

  for (const o of state.officerAssignments) {
    if (!personIds.has(o.personId))
      issues.push(`officerAssignment ${o.id}: personId ${o.personId} missing`)
    if (!roleIds.has(o.roleId))
      issues.push(`officerAssignment ${o.id}: roleId ${o.roleId} missing`)
    if (!isOneOf(o.status, enumValues(OfficerAssignmentStatus)))
      issues.push(`officerAssignment ${o.id}: invalid status`)
    if (!isOneOf(o.probationStatus, enumValues(ProbationStatus)))
      issues.push(`officerAssignment ${o.id}: invalid probationStatus`)
  }

  for (const a of state.workAssignments) {
    if (!officerIds.has(a.ownerOfficerAssignmentId))
      issues.push(`workAssignment ${a.id}: owner ${a.ownerOfficerAssignmentId} missing`)
    for (const c of a.collaboratorIds)
      if (!officerIds.has(c))
        issues.push(`workAssignment ${a.id}: collaborator ${c} missing`)
    for (const d of a.dependencyIds)
      if (!assignmentIds.has(d))
        issues.push(`workAssignment ${a.id}: dependency ${d} missing`)
    if (!isOneOf(a.status, enumValues(WorkAssignmentStatus)))
      issues.push(`workAssignment ${a.id}: invalid status`)
    if (!isOneOf(a.priority, enumValues(Priority)))
      issues.push(`workAssignment ${a.id}: invalid priority`)
    if (a.status === WorkAssignmentStatus.Blocked && !a.blockedReason)
      issues.push(`workAssignment ${a.id}: blocked without blockedReason`)
  }

  for (const d of state.deliverables) {
    if (!assignmentIds.has(d.assignmentId))
      issues.push(`deliverable ${d.id}: assignment ${d.assignmentId} missing`)
    if (!officerIds.has(d.authorOfficerAssignmentId))
      issues.push(`deliverable ${d.id}: author missing`)
    if (!isOneOf(d.type, enumValues(DeliverableType)))
      issues.push(`deliverable ${d.id}: invalid type`)
    if (!isOneOf(d.reviewStatus, enumValues(ReviewStatus)))
      issues.push(`deliverable ${d.id}: invalid reviewStatus`)
  }

  const commitmentIds = new Set(state.commitments.map((c) => c.id))

  for (const dec of state.decisions) {
    if (!officerIds.has(dec.requestingOfficerAssignmentId))
      issues.push(`decision ${dec.id}: requesting officer missing`)
    if (!officerIds.has(dec.decisionOwnerId))
      issues.push(`decision ${dec.id}: decisionOwnerId ${dec.decisionOwnerId} missing`)
    for (const a of dec.affectedAssignmentIds)
      if (!assignmentIds.has(a))
        issues.push(`decision ${dec.id}: affected assignment ${a} missing`)
    for (const c of dec.linkedCommitmentIds)
      if (!commitmentIds.has(c))
        issues.push(`decision ${dec.id}: linked commitment ${c} missing`)
    if (!isOneOf(dec.type, enumValues(DecisionType)))
      issues.push(`decision ${dec.id}: invalid type`)
    if (!isOneOf(dec.status, enumValues(DecisionStatus)))
      issues.push(`decision ${dec.id}: invalid status`)
    if (!isOneOf(dec.stage, enumValues(DecisionStage)))
      issues.push(`decision ${dec.id}: invalid stage`)
  }

  const decisionIds = new Set(state.decisions.map((d) => d.id))
  for (const c of state.commitments) {
    if (!officerIds.has(c.ownerOfficerAssignmentId))
      issues.push(`commitment ${c.id}: owner ${c.ownerOfficerAssignmentId} missing`)
    if (!officerIds.has(c.requestedById))
      issues.push(`commitment ${c.id}: requestedById ${c.requestedById} missing`)
    for (const dep of c.dependencyIds)
      if (!commitmentIds.has(dep))
        issues.push(`commitment ${c.id}: dependency ${dep} missing`)
    for (const d of c.linkedDecisionIds)
      if (!decisionIds.has(d))
        issues.push(`commitment ${c.id}: linked decision ${d} missing`)
    if (!isOneOf(c.status, enumValues(CommitmentStatus)))
      issues.push(`commitment ${c.id}: invalid status`)
    if (!isOneOf(c.confidence, enumValues(ConfidenceLevel)))
      issues.push(`commitment ${c.id}: invalid confidence`)
    if (c.status === CommitmentStatus.Blocked && !c.blockedReason)
      issues.push(`commitment ${c.id}: blocked without blockedReason`)
  }

  for (const e of state.activity) {
    if (!isOneOf(e.eventType, enumValues(ActivityEventType)))
      issues.push(`activity ${e.id}: invalid eventType`)
    if (
      e.relatedEntityType !== null &&
      !isOneOf(e.relatedEntityType, enumValues(RelatedEntityType))
    )
      issues.push(`activity ${e.id}: invalid relatedEntityType`)
  }

  return issues
}

export function assertValidConsoleState(state: ConsoleState): void {
  const issues = validateConsoleState(state)
  if (issues.length > 0) throw new ValidationError(issues)
}
