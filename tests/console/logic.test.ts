import assert from "node:assert/strict"
import { test } from "node:test"

import {
  blockedAssignments,
  computeMetrics,
  deriveHealth,
  generateBrief,
  officerSummary,
  readyDeliverables,
  waitingDecisions,
} from "@/lib/console/domain/logic"
import { createSeedState } from "@/lib/console/persistence/seed"
import {
  OrganizationHealth,
  Priority,
  WorkAssignmentStatus,
} from "@/lib/console/domain/enums"

test("waiting decisions are sorted most-urgent first", () => {
  const decisions = waitingDecisions(createSeedState())
  for (let i = 1; i < decisions.length; i++) {
    const prev = decisions[i - 1].priority
    const cur = decisions[i].priority
    // critical(0) < high(1) < medium(2) < low(3)
    const rank = { critical: 0, high: 1, medium: 2, low: 3 } as const
    assert.ok(rank[prev] <= rank[cur])
  }
})

test("ready deliverables are only submitted ones", () => {
  const ready = readyDeliverables(createSeedState())
  assert.ok(ready.length >= 1)
  assert.ok(ready.every((d) => d.reviewStatus === "submitted"))
})

test("metrics reflect seed state", () => {
  const m = computeMetrics(createSeedState())
  assert.ok(m.officersActive >= 5)
  assert.ok(m.decisionsWaiting >= 5)
  assert.ok(m.blockedAssignments >= 1)
  assert.ok(m.assignmentsInProgress >= 1)
})

test("health is attention-required when work is blocked but nothing critical waits", () => {
  const health = deriveHealth(createSeedState())
  assert.equal(health, OrganizationHealth.AttentionRequired)
})

test("a waiting critical decision drives health to critical", () => {
  const state = createSeedState()
  state.decisions[0].priority = Priority.Critical
  state.decisions[0].status = "waiting"
  assert.equal(deriveHealth(state), OrganizationHealth.Critical)
})

test("health is healthy when nothing is waiting, blocked, or in review", () => {
  const state = createSeedState()
  state.decisions = state.decisions.map((d) => ({ ...d, status: "approved" as const }))
  state.deliverables = state.deliverables.map((d) => ({ ...d, reviewStatus: "approved" as const }))
  state.workAssignments = state.workAssignments.map((a) =>
    a.status === WorkAssignmentStatus.Blocked
      ? { ...a, status: WorkAssignmentStatus.InProgress, blockedReason: null }
      : a,
  )
  assert.equal(deriveHealth(state), OrganizationHealth.Healthy)
})

test("officer summary surfaces blocked state and current work", () => {
  const state = createSeedState()
  const cka = officerSummary(state, "oa-cka")
  assert.ok(cka)
  assert.equal(cka.isBlocked, true)
  assert.ok(cka.currentAssignments.length >= 1)
})

test("generateBrief summarizes health and counts", () => {
  const state = createSeedState()
  const brief = generateBrief(state, {
    id: "brief-test",
    periodStart: "2026-07-20T18:00:00.000Z",
    periodEnd: "2026-07-21T06:00:00.000Z",
    generatedAt: "2026-07-21T06:00:00.000Z",
  })
  assert.equal(brief.organizationHealth, OrganizationHealth.AttentionRequired)
  assert.ok(brief.decisionsWaiting >= 5)
  assert.ok(brief.risks.length >= 1)
  assert.ok(brief.summary.length > 0)
})

test("blocked assignments helper returns only blocked", () => {
  const blocked = blockedAssignments(createSeedState())
  assert.ok(blocked.every((a) => a.status === WorkAssignmentStatus.Blocked))
})
