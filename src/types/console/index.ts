/**
 * Founder Console — domain entity types.
 *
 * Roles are deliberately kept separate from the people (AI officers/workers)
 * who fill them: a Role is a durable position with a mission and authority; an
 * OfficerAssignment binds a Person to a Role for a period. This mirrors the
 * long-term platform's separation of "position" from "occupant".
 *
 * IMPORTANT — this model represents the current engineering implementation and
 * must NOT be treated as the final Organizational Twin ontology. See
 * docs/adr/0004-canonical-model-boundary.md.
 */

import type {
  ActivityEventType,
  DecisionAction,
  DecisionStatus,
  DecisionType,
  DeliverableType,
  OfficerAssignmentStatus,
  OrganizationHealth,
  PersonType,
  Priority,
  ProbationStatus,
  RelatedEntityType,
  ReviewStatus,
  RoleStatus,
  WorkAssignmentStatus,
} from "@/lib/console/domain/enums"

/** ISO-8601 timestamp string. */
export type IsoDateTime = string

/**
 * Optional knowledge metadata — architectural preparation for the future
 * Organizational Mind. Every major entity can carry it, but nothing reads or
 * writes it yet: no business logic, no UI exposure, no persistence
 * requirement. All fields (and the container itself) are optional so existing
 * data and seeds remain valid unchanged.
 */
export interface KnowledgeMetadata {
  /** Where this knowledge came from (system, officer, document, session…). */
  provenance?: string
  /** 0–1 confidence in the entity's current content. */
  confidence?: number
  /** Links or references supporting the entity's content. */
  evidence?: EvidenceLink[]
  /** Ids of related entities, cross-type. */
  relatedEntities?: string[]
  /** Prior states or change notes, newest last. */
  history?: Array<{ at: IsoDateTime; note: string }>
}

export interface Organization {
  id: string
  name: string
  workingName: string
  mission: string
  status: OrganizationHealth
  createdAt: IsoDateTime
  updatedAt: IsoDateTime
  meta?: KnowledgeMetadata
}

export interface Person {
  id: string
  name: string
  personType: PersonType
  title: string
  meta?: KnowledgeMetadata
}

export interface Role {
  id: string
  title: string
  mission: string
  responsibilities: string[]
  authority: string
  boundaries: string[]
  reportsToRoleId: string | null
  status: RoleStatus
  meta?: KnowledgeMetadata
}

export interface OfficerAssignment {
  id: string
  personId: string
  roleId: string
  startDate: IsoDateTime
  status: OfficerAssignmentStatus
  probationStatus: ProbationStatus
  meta?: KnowledgeMetadata
}

export interface ProgressUpdate {
  at: IsoDateTime
  note: string
}

export interface WorkAssignment {
  id: string
  title: string
  objective: string
  description: string
  ownerOfficerAssignmentId: string
  collaboratorIds: string[]
  priority: Priority
  status: WorkAssignmentStatus
  dueDate: IsoDateTime | null
  acceptanceCriteria: string[]
  dependencyIds: string[]
  linkedOutcomeIds: string[]
  /** Human-readable reason when status is `blocked`. */
  blockedReason: string | null
  progress: ProgressUpdate[]
  createdBy: string
  createdAt: IsoDateTime
  updatedAt: IsoDateTime
  meta?: KnowledgeMetadata
}

export interface ReviewComment {
  at: IsoDateTime
  author: string
  comment: string
  outcome: ReviewStatus | null
}

export interface Deliverable {
  id: string
  assignmentId: string
  title: string
  type: DeliverableType
  version: number
  summary: string
  content: string
  authorOfficerAssignmentId: string
  reviewStatus: ReviewStatus
  reviewComments: ReviewComment[]
  supportingEvidence: EvidenceLink[]
  createdAt: IsoDateTime
  reviewedAt: IsoDateTime | null
  meta?: KnowledgeMetadata
}

export interface EvidenceLink {
  label: string
  href: string
  /** Origin system, e.g. "claude-code", "codex", "pi", "document". */
  kind: string
}

export interface DecisionAlternative {
  title: string
  description: string
}

export interface Decision {
  id: string
  title: string
  type: DecisionType
  priority: Priority
  context: string
  whyItMatters: string
  recommendation: string
  alternatives: DecisionAlternative[]
  expectedImpact: string
  estimatedDecisionMinutes: number
  requestingOfficerAssignmentId: string
  affectedAssignmentIds: string[]
  supportingEvidence: EvidenceLink[]
  status: DecisionStatus
  resolution: DecisionAction | null
  rationale: string | null
  decidedAt: IsoDateTime | null
  meta?: KnowledgeMetadata
}

export interface ActivityEvent {
  id: string
  eventType: ActivityEventType
  title: string
  description: string
  /** OfficerAssignment id, Person id, or null for organization-level events. */
  actorId: string | null
  relatedEntityType: RelatedEntityType | null
  relatedEntityId: string | null
  occurredAt: IsoDateTime
  meta?: KnowledgeMetadata
}

export interface ExecutiveBrief {
  id: string
  periodStart: IsoDateTime
  periodEnd: IsoDateTime
  summary: string
  highlights: string[]
  risks: string[]
  decisionsWaiting: number
  deliverablesReady: number
  organizationHealth: OrganizationHealth
  generatedAt: IsoDateTime
  meta?: KnowledgeMetadata
}

/** The complete persisted state of a Founder Console organization. */
export interface ConsoleState {
  organization: Organization
  people: Person[]
  roles: Role[]
  officerAssignments: OfficerAssignment[]
  workAssignments: WorkAssignment[]
  deliverables: Deliverable[]
  decisions: Decision[]
  activity: ActivityEvent[]
  briefs: ExecutiveBrief[]
  /** Persisted EA conversation turns (MVP: single conversation). */
  conversation: ConversationTurn[]
}

export interface ConversationTurn {
  id: string
  role: "director" | "ea"
  text: string
  at: IsoDateTime
}
