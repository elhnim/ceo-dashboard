import assert from "node:assert/strict"
import { test } from "node:test"

import { createProjectSeed } from "@/lib/console/project/seed"
import {
  activeSprint,
  activeWork,
  briefing,
  currentLayer,
  currentMilestone,
  milestoneProgress,
  nextSessionTopic,
  openApprovals,
  productBacklog,
  projectHealth,
  recommendedAction,
  sessionAgenda,
} from "@/lib/console/project/logic"
import {
  beginSessionTx,
  mergeSeedWithRuntime,
  resolveApprovalTx,
} from "@/lib/console/project/engine"

const AT = "2026-07-22T18:00:00.000Z"

test("exactly one layer and one milestone are current", () => {
  const s = createProjectSeed()
  assert.equal(s.layers.filter((l) => l.status === "current").length, 1)
  assert.equal(s.milestones.filter((m) => m.status === "current").length, 1)
  assert.equal(currentLayer(s).id, "layer-3")
  assert.equal(currentMilestone(s).code, "EO-005")
})

test("the engine always derives exactly one recommended action", () => {
  const s = createProjectSeed()
  const rec = recommendedAction(s)
  assert.ok(rec.title.length > 0)
  assert.ok(rec.why.length > 0)
  assert.ok(rec.estimatedMinutes > 0)
  assert.ok(rec.expectedOutcome.length > 0)
  assert.ok(rec.expectedImpact.length > 0)
  // With an open approval, the approval wins.
  assert.equal(rec.source, "approval")
})

test("recommendation falls back to the session when approvals clear", () => {
  const s = createProjectSeed()
  s.approvals = s.approvals.map((a) => ({ ...a, status: "approved" as const }))
  const rec = recommendedAction(s)
  assert.equal(rec.source, "session")
  assert.match(rec.title, /Commitment/i)
})

test("recommendation falls back to milestone work, then backlog", () => {
  const s = createProjectSeed()
  s.approvals = s.approvals.map((a) => ({ ...a, status: "approved" as const }))
  const sprint = activeSprint(s)!
  sprint.topics = sprint.topics.map((t) => ({ ...t, status: "done" as const }))
  assert.equal(recommendedAction(s).source, "milestone")

  const ms = currentMilestone(s)
  ms.items = ms.items.map((i) => ({ ...i, status: "done" as const }))
  ms.status = "completed"
  assert.equal(recommendedAction(s).source, "backlog")
})

test("health derives yellow with approvals waiting, red when blocked or failing", () => {
  const s = createProjectSeed()
  assert.equal(projectHealth(s).health, "yellow")

  const blocked = createProjectSeed()
  currentMilestone(blocked).items[0].status = "blocked"
  assert.equal(projectHealth(blocked).health, "red")

  const failing = createProjectSeed()
  failing.engineering.buildStatus = "failing"
  assert.equal(projectHealth(failing).health, "red")

  const green = createProjectSeed()
  green.approvals = green.approvals.map((a) => ({ ...a, status: "approved" as const }))
  const sprint = activeSprint(green)!
  sprint.topics = sprint.topics.map((t) => ({ ...t, status: "done" as const }))
  assert.equal(projectHealth(green).health, "green")
})

test("milestone progress and active work derive from item statuses", () => {
  const s = createProjectSeed()
  const ms = currentMilestone(s)
  const { done, total } = milestoneProgress(ms)
  assert.equal(total, ms.items.length)
  assert.equal(done, ms.items.filter((i) => i.status === "done").length)
  assert.ok(activeWork(s).every((i) => i.status !== "done"))
})

test("product backlog is priority-ordered and excludes completed milestones", () => {
  const backlog = productBacklog(createProjectSeed())
  assert.ok(backlog.length >= 3)
  assert.ok(backlog.every((m) => m.status !== "completed"))
  for (let i = 1; i < backlog.length; i++)
    assert.ok(backlog[i - 1].priority <= backlog[i].priority)
})

test("the briefing feeds every Executive Office panel from derived state", () => {
  const b = briefing(createProjectSeed())
  assert.ok(b.currentLayer && b.currentMilestone && b.currentSprint)
  assert.ok(b.overallStatus.includes("EO-005"))
  assert.ok(["green", "yellow", "red"].includes(b.health))
  assert.ok(b.waitingForMe.length > 0)
  assert.ok(b.activeWork.length > 0)
  assert.ok(b.researchPrepared.length >= 4)
  assert.ok(b.architectureBacklog.length >= 4)
  assert.ok(b.productBacklog.length >= 3)
  assert.ok(b.log.length >= 5)
  // Log is newest-first.
  for (let i = 1; i < b.log.length; i++)
    assert.ok(b.log[i - 1].at >= b.log[i].at)
})

test("session agenda derives from the next session-ready topic with materials", () => {
  const s = createProjectSeed()
  const agenda = sessionAgenda(s)
  assert.ok(agenda)
  assert.equal(agenda.topic.id, nextSessionTopic(s)!.id)
  assert.ok(agenda.materials.length > 0)
  assert.ok(agenda.topic.questions.length > 0)
  assert.ok(agenda.topic.expectedDeliverables.length > 0)
  assert.equal(agenda.startedAt, null)
})

test("beginning a session records it and appends to the log", () => {
  const s = createProjectSeed()
  const { state } = beginSessionTx(s, { topicId: "topic-commitment", at: AT })
  assert.equal(state.sessions.length, 1)
  assert.equal(state.log.at(-1)?.kind, "architecture")
  assert.equal(sessionAgenda(state)?.startedAt, AT)
})

test("runtime mutations survive a seed merge (approvals, sessions, log)", () => {
  const s = createProjectSeed()
  const afterApproval = resolveApprovalTx(s, {
    id: "ap-research-review",
    resolution: "approved",
    rationale: "Reviewed.",
    at: AT,
  }).state
  const afterSession = beginSessionTx(afterApproval, {
    topicId: "topic-commitment",
    at: AT,
  }).state

  // Simulate what the engine persists, then a fresh load over the seed.
  const merged = mergeSeedWithRuntime({
    approvals: afterSession.approvals,
    sessions: afterSession.sessions,
    log: afterSession.log,
  })
  assert.equal(
    merged.approvals.find((a) => a.id === "ap-research-review")?.status,
    "approved",
  )
  assert.equal(merged.sessions.length, 1)
  assert.ok(merged.log.some((e) => e.title.startsWith("Approved: Research review")))
  assert.ok(merged.log.some((e) => e.title === "Executive session begun"))
  // Seed facts always win for curated content.
  assert.equal(merged.research.length, createProjectSeed().research.length)
})

test("resolving an approval closes it, logs it, and reranks the recommendation", () => {
  const s = createProjectSeed()
  const first = openApprovals(s)[0]
  const { state, result } = resolveApprovalTx(s, {
    id: first.id,
    resolution: "approved",
    rationale: "Merged.",
    at: AT,
  })
  assert.equal(result.status, "approved")
  assert.equal(state.log.at(-1)?.title, `Approved: ${first.title}`)
  assert.notEqual(recommendedAction(state).title, first.title)
  // Double-resolution is rejected.
  assert.throws(() =>
    resolveApprovalTx(state, { id: first.id, resolution: "approved", at: AT }),
  )
})
