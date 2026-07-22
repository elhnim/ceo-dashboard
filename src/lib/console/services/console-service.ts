/**
 * Founder Console — application service.
 *
 * The single entry point the API routes and server components use. It composes
 * pure domain reads (logic.ts), wraps pure transitions (transitions.ts) in
 * repository transactions, and reaches the outside world only through the
 * integration registry. No UI or route ever touches the repository directly.
 */

import "server-only"

import {
  activeAssignments,
  activeCommitments,
  activityFeed,
  allOfficerSummaries,
  averageConfidence,
  commitmentsForOfficer,
  computeMetrics,
  deliveryScore,
  emergingRisks,
  focusToday,
  generateBrief as buildBrief,
  healthSignal,
  isOverdue,
  latestBrief,
  momentum,
  officerSummary,
  officerWorkload,
  readyDeliverables,
  todaysPriorities,
  waitingDecisions,
  waitingForMe,
  type EmergingRisk,
  type Momentum,
  type OfficerCommitments,
  type OfficerSummary,
  type OrganizationMetrics,
  type TodayPriority,
  type WaitingItem,
} from "@/lib/console/domain/logic"
import {
  addCommitmentNoteTx,
  appendConversationTx,
  createCommitmentTx,
  createWorkAssignmentTx,
  resolveDecisionTx,
  reviewDeliverableTx,
  setCommitmentStatusTx,
  setDecisionStageTx,
  setWorkStatusTx,
  type DeliverableReviewOutcome,
  type NewCommitmentInput,
  type NewWorkAssignmentInput,
} from "@/lib/console/domain/transitions"
import { WORK_ASSIGNMENT_STATUS_ORDER } from "@/lib/console/domain/enums"
import { getIntegrations } from "@/lib/console/integrations/mock-adapters"
import { getRepository } from "@/lib/console/persistence/local-json-repository"
import type { DecisionAction, DecisionStage } from "@/lib/console/domain/enums"
import type {
  ActivityEvent,
  Commitment,
  ConsoleState,
  ConversationTurn,
  Decision,
  Deliverable,
  ExecutiveBrief,
  Organization,
  WorkAssignment,
} from "@/types/console"

const now = () => new Date().toISOString()
const genId = (prefix: string) =>
  `${prefix}-${globalThis.crypto.randomUUID().slice(0, 8)}`

function repo() {
  return getRepository()
}

// --- Reads ------------------------------------------------------------------

export async function getState(): Promise<ConsoleState> {
  return repo().load()
}

export interface Overview {
  organization: Organization
  health: ReturnType<typeof healthSignal>
  metrics: OrganizationMetrics
  todaysPriorities: TodayPriority[]
  focusToday: Commitment[]
  waitingForMe: WaitingItem[]
  emergingRisks: EmergingRisk[]
  momentum: Momentum
  activeCommitmentCount: number
  completedThisWeek: number
  maxWorkload: { name: string; load: number } | null
  waitingDecisions: Decision[]
  readyDeliverables: Deliverable[]
  officers: OfficerSummary[]
  activeAssignments: WorkAssignment[]
  latestBrief: ExecutiveBrief | null
}

export async function getOverview(): Promise<Overview> {
  const state = await repo().load()
  const nowIso = now()
  const prior = latestBrief(state)
  const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()

  let maxWorkload: Overview["maxWorkload"] = null
  for (const summary of allOfficerSummaries(state)) {
    if (summary.role.title === "Product Director") continue
    const load = officerWorkload(state, summary.officerAssignment.id)
    if (!maxWorkload || load > maxWorkload.load)
      maxWorkload = { name: summary.person.name, load }
  }

  return {
    organization: state.organization,
    health: healthSignal(state, nowIso),
    metrics: computeMetrics(state),
    todaysPriorities: todaysPriorities(state),
    focusToday: focusToday(state, nowIso),
    waitingForMe: waitingForMe(state),
    emergingRisks: emergingRisks(state, nowIso),
    momentum: momentum(state, prior ? prior.periodEnd : null),
    activeCommitmentCount: activeCommitments(state).length,
    completedThisWeek: state.commitments.filter(
      (c) => c.completedAt !== null && c.completedAt > weekAgo,
    ).length,
    maxWorkload,
    waitingDecisions: waitingDecisions(state),
    readyDeliverables: readyDeliverables(state),
    officers: allOfficerSummaries(state),
    activeAssignments: activeAssignments(state),
    latestBrief: prior,
  }
}

export async function listOfficers(): Promise<OfficerSummary[]> {
  return allOfficerSummaries(await repo().load())
}

export interface OfficerDetail {
  summary: OfficerSummary
  commitments: OfficerCommitments
  workload: number
  averageConfidence: ReturnType<typeof averageConfidence>
  deliveryScore: ReturnType<typeof deliveryScore>
  deliverables: Deliverable[]
  decisions: Decision[]
  activity: ActivityEvent[]
}

export async function getOfficerDetail(
  officerAssignmentId: string,
): Promise<OfficerDetail | null> {
  const state = await repo().load()
  const summary = officerSummary(state, officerAssignmentId)
  if (!summary) return null
  return {
    summary,
    commitments: commitmentsForOfficer(state, officerAssignmentId, now()),
    workload: officerWorkload(state, officerAssignmentId),
    averageConfidence: averageConfidence(state, officerAssignmentId),
    deliveryScore: deliveryScore(state, officerAssignmentId),
    deliverables: state.deliverables.filter(
      (d) => d.authorOfficerAssignmentId === officerAssignmentId,
    ),
    decisions: state.decisions.filter(
      (d) => d.requestingOfficerAssignmentId === officerAssignmentId,
    ),
    activity: state.activity
      .filter((e) => e.actorId === officerAssignmentId)
      .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)),
  }
}

// --- Commitments (Milestone 2) ------------------------------------------------

export async function listCommitments(): Promise<Commitment[]> {
  return (await repo().load()).commitments
}

export interface CommitmentDetail {
  commitment: Commitment
  ownerName: string
  requestedByName: string
  dependencies: Commitment[]
  dependents: Commitment[]
  linkedDecisions: Decision[]
  overdue: boolean
}

export async function getCommitmentDetail(
  id: string,
): Promise<CommitmentDetail | null> {
  const state = await repo().load()
  const commitment = state.commitments.find((c) => c.id === id)
  if (!commitment) return null
  const nameOf = (oaId: string) => {
    const oa = state.officerAssignments.find((o) => o.id === oaId)
    const person = oa ? state.people.find((p) => p.id === oa.personId) : undefined
    return person?.name ?? "an officer"
  }
  return {
    commitment,
    ownerName: nameOf(commitment.ownerOfficerAssignmentId),
    requestedByName: nameOf(commitment.requestedById),
    dependencies: commitment.dependencyIds
      .map((depId) => state.commitments.find((c) => c.id === depId))
      .filter((c): c is Commitment => c !== undefined),
    dependents: state.commitments.filter((c) =>
      c.dependencyIds.includes(commitment.id),
    ),
    linkedDecisions: state.decisions.filter((d) =>
      commitment.linkedDecisionIds.includes(d.id),
    ),
    overdue: isOverdue(commitment, now()),
  }
}

export async function createCommitment(
  data: NewCommitmentInput,
): Promise<Commitment> {
  return repo().transaction((state) =>
    createCommitmentTx(state, { data, id: genId("cm"), at: now() }),
  )
}

export async function setCommitmentStatus(
  id: string,
  status: Commitment["status"],
  options?: { reason?: string; note?: string },
): Promise<Commitment> {
  return repo().transaction((state) =>
    setCommitmentStatusTx(state, {
      id,
      status,
      reason: options?.reason,
      note: options?.note,
      at: now(),
    }),
  )
}

export async function addCommitmentNote(
  id: string,
  note: string,
): Promise<Commitment> {
  return repo().transaction((state) =>
    addCommitmentNoteTx(state, { id, note, author: "Minh", at: now() }),
  )
}

export async function setDecisionStage(
  id: string,
  stage: DecisionStage,
): Promise<Decision> {
  return repo().transaction((state) =>
    setDecisionStageTx(state, { id, stage, at: now() }),
  )
}

export interface OfficerOption {
  id: string
  name: string
  roleTitle: string
}

/** Officer choices for the Delegate flow (excludes the Director). */
export async function listOfficerOptions(): Promise<OfficerOption[]> {
  const state = await repo().load()
  return allOfficerSummaries(state)
    .filter((s) => s.role.title !== "Product Director")
    .map((s) => ({
      id: s.officerAssignment.id,
      name: s.person.name,
      roleTitle: s.role.title,
    }))
}

export interface WorkBoard {
  status: WorkAssignment["status"]
  assignments: WorkAssignment[]
}

export async function getWorkBoard(): Promise<WorkBoard[]> {
  const state = await repo().load()
  return WORK_ASSIGNMENT_STATUS_ORDER.map((status) => ({
    status,
    assignments: state.workAssignments.filter((a) => a.status === status),
  }))
}

export async function getWorkAssignment(
  id: string,
): Promise<{ assignment: WorkAssignment; deliverables: Deliverable[]; activity: ActivityEvent[] } | null> {
  const state = await repo().load()
  const assignment = state.workAssignments.find((a) => a.id === id)
  if (!assignment) return null
  return {
    assignment,
    deliverables: state.deliverables.filter((d) => d.assignmentId === id),
    activity: state.activity
      .filter((e) => e.relatedEntityId === id)
      .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)),
  }
}

export async function listDecisions(): Promise<Decision[]> {
  return (await repo().load()).decisions
}

export async function getDecision(id: string): Promise<Decision | null> {
  const state = await repo().load()
  return state.decisions.find((d) => d.id === id) ?? null
}

export async function getDeliverable(id: string): Promise<Deliverable | null> {
  const state = await repo().load()
  return state.deliverables.find((d) => d.id === id) ?? null
}

export async function getActivity(limit?: number): Promise<ActivityEvent[]> {
  return activityFeed(await repo().load(), limit)
}

export async function getConversation(): Promise<ConversationTurn[]> {
  return (await repo().load()).conversation
}

// --- Mutations --------------------------------------------------------------

export async function resolveDecision(
  id: string,
  action: DecisionAction,
  rationale?: string,
): Promise<Decision> {
  return repo().transaction((state) =>
    resolveDecisionTx(state, { id, action, rationale, at: now() }),
  )
}

export async function reviewDeliverable(
  id: string,
  outcome: DeliverableReviewOutcome,
  comment: string,
): Promise<Deliverable> {
  return repo().transaction((state) =>
    reviewDeliverableTx(state, {
      id,
      outcome,
      comment,
      author: "Minh",
      at: now(),
    }),
  )
}

export async function createWorkAssignment(
  data: NewWorkAssignmentInput,
): Promise<WorkAssignment> {
  return repo().transaction((state) =>
    createWorkAssignmentTx(state, { data, id: genId("wa"), at: now() }),
  )
}

export async function setWorkStatus(
  id: string,
  status: WorkAssignment["status"],
  options?: { reason?: string; note?: string },
): Promise<WorkAssignment> {
  return repo().transaction((state) =>
    setWorkStatusTx(state, {
      id,
      status,
      reason: options?.reason,
      note: options?.note,
      at: now(),
    }),
  )
}

export interface EaResult {
  reply: string
  intent?: string
  conversation: ConversationTurn[]
}

export async function sendEaMessage(message: string): Promise<EaResult> {
  const state = await repo().load()
  const { conversation } = getIntegrations()
  const history = state.conversation.map((t) => ({ role: t.role, text: t.text }))
  const reply = await conversation.reply({ message, history, state })
  const at = now()
  const stored = await repo().transaction((s) =>
    appendConversationTx(s, {
      directorText: message,
      eaText: reply.text,
      directorId: genId("turn"),
      eaId: genId("turn"),
      at,
    }),
  )
  return { reply: reply.text, intent: reply.intent, conversation: stored }
}

export async function generateBrief(): Promise<ExecutiveBrief> {
  const state = await repo().load()
  const prior = latestBrief(state)
  const at = now()
  const brief = buildBrief(state, {
    id: genId("brief"),
    periodStart: prior ? prior.periodEnd : state.organization.createdAt,
    periodEnd: at,
    generatedAt: at,
  })
  await repo().transaction((s) => ({
    state: { ...s, briefs: [...s.briefs, brief] },
    result: brief,
  }))
  return brief
}
