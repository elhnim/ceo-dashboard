/**
 * Project State Engine — pure derivations.
 *
 * Everything the Executive Office displays is computed here from the stored
 * ProjectState. Nothing in the UI hand-writes status, health, progress, or
 * the recommendation; if a panel needs a fact, it comes from state, and if it
 * needs a judgment, it comes from these functions.
 */

import type {
  ExecutiveApproval,
  Milestone,
  MilestoneItem,
  ProjectBriefing,
  ProjectState,
  RecommendedAction,
  SessionAgenda,
  Sprint,
  SprintTopic,
} from "@/types/project"

export function currentLayer(state: ProjectState) {
  return state.layers.find((l) => l.status === "current") ?? state.layers.at(-1)!
}

export function currentMilestone(state: ProjectState): Milestone {
  return (
    state.milestones.find((m) => m.status === "current") ??
    productBacklog(state)[0]
  )
}

export function activeSprint(state: ProjectState): Sprint | null {
  return state.sprints.find((s) => s.status === "active") ?? null
}

export function openApprovals(state: ProjectState): ExecutiveApproval[] {
  return state.approvals
    .filter((a) => a.status === "open")
    .sort((a, b) => a.priority - b.priority)
}

export function milestoneProgress(milestone: Milestone): { done: number; total: number } {
  const total = milestone.items.length
  const done = milestone.items.filter((i) => i.status === "done").length
  return { done, total }
}

export function activeWork(state: ProjectState): MilestoneItem[] {
  return currentMilestone(state).items.filter((i) => i.status !== "done")
}

/** Upcoming milestones ordered by priority (the product backlog). */
export function productBacklog(state: ProjectState): Milestone[] {
  return state.milestones
    .filter((m) => m.status !== "completed")
    .sort((a, b) => a.priority - b.priority)
}

/** The next session topic: the highest-priority session-ready sprint topic. */
export function nextSessionTopic(state: ProjectState): SprintTopic | null {
  const sprint = activeSprint(state)
  if (!sprint) return null
  return sprint.topics.find((t) => t.status === "session-ready") ?? null
}

/**
 * Exactly one recommended next action, derived by rank:
 *  1. the most urgent open executive approval;
 *  2. otherwise the next session-ready architecture topic;
 *  3. otherwise the first open item of the current milestone;
 *  4. otherwise the top of the product backlog.
 */
export function recommendedAction(state: ProjectState): RecommendedAction {
  const approvals = openApprovals(state)
  if (approvals.length > 0) {
    const a = approvals[0]
    return {
      title: a.title,
      why: a.why,
      estimatedMinutes: a.estimatedMinutes,
      expectedOutcome: a.expectedOutcome,
      expectedImpact: a.expectedImpact,
      href: a.href,
      source: "approval",
    }
  }

  const topic = nextSessionTopic(state)
  if (topic) {
    const sprint = activeSprint(state)!
    return {
      title: `Hold the session: ${topic.title}`,
      why: `${sprint.title} cannot advance without this session; engineering stays paused until the architecture is settled.`,
      estimatedMinutes: 30,
      expectedOutcome: topic.expectedDeliverables.join("; "),
      expectedImpact: sprint.objective,
      href: "/session",
      source: "session",
    }
  }

  const item = activeWork(state)[0]
  if (item) {
    const ms = currentMilestone(state)
    return {
      title: `Advance ${ms.code}: ${item.title}`,
      why: `${ms.code} is the current milestone; this item is its next open piece.`,
      estimatedMinutes: 30,
      expectedOutcome: `${item.title} — done`,
      expectedImpact: ms.objective,
      href: "/",
      source: "milestone",
    }
  }

  const next = productBacklog(state)[0]
  return {
    title: `Start the next milestone: ${next.code} — ${next.title}`,
    why: "Nothing is waiting on you and the current milestone is complete.",
    estimatedMinutes: 15,
    expectedOutcome: `${next.code} planned and underway`,
    expectedImpact: next.objective,
    href: "/",
    source: "backlog",
  }
}

/**
 * Project health, derived:
 *  red    — anything blocked in the current milestone, or the build failing;
 *  yellow — executive approvals waiting, or architecture topics awaiting a
 *           session while engineering is paused;
 *  green  — none of the above.
 */
export function projectHealth(state: ProjectState): { health: "green" | "yellow" | "red"; reason: string } {
  if (state.engineering.buildStatus === "failing")
    return { health: "red", reason: "The build is failing." }
  const blocked = currentMilestone(state).items.filter((i) => i.status === "blocked")
  if (blocked.length > 0)
    return { health: "red", reason: `${blocked.length} item(s) blocked in the current milestone.` }

  const approvals = openApprovals(state)
  if (approvals.length > 0)
    return {
      health: "yellow",
      reason: `${approvals.length} executive approval${approvals.length > 1 ? "s" : ""} waiting.`,
    }
  if (nextSessionTopic(state))
    return { health: "yellow", reason: "An architecture session is ready while engineering is paused." }

  return { health: "green", reason: "Nothing blocked; nothing waiting on you." }
}

export function overallStatus(state: ProjectState): string {
  const ms = currentMilestone(state)
  const { done, total } = milestoneProgress(ms)
  const sprint = activeSprint(state)
  const parts = [
    total > 0
      ? `${ms.code} in progress — ${done}/${total} items done`
      : `${ms.code} in planning`,
  ]
  if (sprint) parts.push(`${sprint.title} active`)
  return parts.join(" · ")
}

/** The full derived briefing every Executive Office panel consumes. */
export function briefing(state: ProjectState): ProjectBriefing {
  const ms = currentMilestone(state)
  const health = projectHealth(state)
  return {
    greetingContext: `${state.programName} · ${currentLayer(state).name}`,
    currentLayer: currentLayer(state),
    currentMilestone: ms,
    currentSprint: activeSprint(state),
    overallStatus: overallStatus(state),
    health: health.health,
    healthReason: health.reason,
    recommended: recommendedAction(state),
    waitingForMe: openApprovals(state),
    activeWork: activeWork(state),
    milestoneProgress: milestoneProgress(ms),
    researchPrepared: state.research.filter((r) => r.status === "prepared"),
    engineering: state.engineering,
    architectureBacklog: [...state.architectureBacklog].sort((a, b) => a.priority - b.priority),
    productBacklog: productBacklog(state),
    log: [...state.log].sort((a, b) => b.at.localeCompare(a.at)),
  }
}

/** The agenda Begin Session opens: the next session-ready topic + materials. */
export function sessionAgenda(state: ProjectState): SessionAgenda | null {
  const sprint = activeSprint(state)
  const topic = nextSessionTopic(state)
  if (!sprint || !topic) return null
  const lastSession = state.sessions
    .filter((s) => s.topicId === topic.id)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0]
  return {
    sprintTitle: sprint.title,
    topic,
    materials: state.research.filter((r) => topic.materialIds.includes(r.id)),
    startedAt: lastSession?.startedAt ?? null,
  }
}
