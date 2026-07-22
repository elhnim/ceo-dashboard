/**
 * Project State Engine — types.
 *
 * The central model of Founder Console's OWN development program. Every
 * Executive Office panel consumes this state (via the project service); the
 * briefing — status, health, progress, waiting list, and the single
 * recommended next action — is DERIVED by pure functions in
 * `src/lib/console/project/logic.ts`, never hardcoded in components.
 *
 * Facts live in the seed and evolve through service mutations (approvals,
 * sessions) and per-cycle curation commits by the Executive Office.
 */

export type IsoDateTime = string

export type LayerStatus = "completed" | "current" | "planned"

export interface ProgramLayer {
  id: string
  name: string
  status: LayerStatus
  summary: string
}

export type WorkItemStatus =
  | "planned"
  | "in-progress"
  | "in-review"
  | "blocked"
  | "done"

export interface MilestoneItem {
  id: string
  title: string
  owner: string
  status: WorkItemStatus
  /** Short human estimate, e.g. "today", "~2 sessions". */
  eta: string
}

export interface Milestone {
  id: string
  title: string
  /** e.g. "EO-005" or "M2" */
  code: string
  status: "completed" | "current" | "planned"
  objective: string
  items: MilestoneItem[]
  /** Order in the product backlog (lower = sooner). */
  priority: number
}

export interface SprintTopic {
  id: string
  title: string
  status: "session-ready" | "ready" | "in-review" | "done" | "deferred"
  questions: string[]
  /** Ids of research briefs that support this topic. */
  materialIds: string[]
  expectedDeliverables: string[]
  decision?: DecisionCard
}

export interface DecisionCard {
  background: string
  options: string[]
  tradeoffs: string
  recommendation: string
  risks: string
}

export interface Sprint {
  id: string
  title: string
  status: "active" | "complete" | "planned"
  objective: string
  topics: SprintTopic[]
}

export type ApprovalKind = "architecture" | "merge" | "roadmap" | "research"

export interface ExecutiveApproval {
  id: string
  kind: ApprovalKind
  title: string
  detail: string
  href: string
  estimatedMinutes: number
  /** Lower = more urgent. */
  priority: number
  status: "open" | "approved" | "deferred"
  resolvedAt: IsoDateTime | null
  rationale: string | null
  /** Fields the recommendation derivation composes from. */
  why: string
  expectedOutcome: string
  expectedImpact: string
}

export interface ResearchBrief {
  id: string
  title: string
  source: string
  summary: string
  relevance: string
  status: "prepared" | "reviewed"
}

export interface BacklogItem {
  id: string
  title: string
  detail: string
  priority: number
  status: "ready" | "in-review" | "in-progress" | "paused" | "planned" | "done"
}

export type LogKind = "order" | "milestone" | "decision" | "architecture"

export interface ExecutiveLogEntry {
  at: IsoDateTime
  kind: LogKind
  title: string
  detail: string
}

/** Curated engineering facts, refreshed by the Executive Office each cycle. */
export interface EngineeringStatus {
  branch: string
  buildStatus: "passing" | "failing" | "unknown"
  tests: { total: number; passing: number }
  latestMilestone: string
  latestAdr: string
  openPullRequest: string | null
}

export interface SessionRecord {
  startedAt: IsoDateTime
  topicId: string
}

/** The persisted project state — the engine's single source of truth. */
export interface ProjectState {
  programName: string
  layers: ProgramLayer[]
  milestones: Milestone[]
  sprints: Sprint[]
  approvals: ExecutiveApproval[]
  research: ResearchBrief[]
  architectureBacklog: BacklogItem[]
  engineeringBacklog: BacklogItem[]
  log: ExecutiveLogEntry[]
  engineering: EngineeringStatus
  sessions: SessionRecord[]
}

// --- Derived (never stored) ---------------------------------------------------

export interface RecommendedAction {
  title: string
  why: string
  estimatedMinutes: number
  expectedOutcome: string
  expectedImpact: string
  href: string
  /** What the recommendation was derived from. */
  source: "approval" | "session" | "milestone" | "backlog"
}

export interface ProjectBriefing {
  greetingContext: string
  currentLayer: ProgramLayer
  currentMilestone: Milestone
  currentSprint: Sprint | null
  overallStatus: string
  health: "green" | "yellow" | "red"
  healthReason: string
  recommended: RecommendedAction
  waitingForMe: ExecutiveApproval[]
  activeWork: MilestoneItem[]
  milestoneProgress: { done: number; total: number }
  researchPrepared: ResearchBrief[]
  engineering: EngineeringStatus
  architectureBacklog: BacklogItem[]
  productBacklog: Milestone[]
  log: ExecutiveLogEntry[]
}

export interface SessionAgenda {
  sprintTitle: string
  topic: SprintTopic
  materials: ResearchBrief[]
  startedAt: IsoDateTime | null
}
