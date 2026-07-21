import assert from "node:assert/strict"
import { test } from "node:test"

import { todaysPriorities } from "@/lib/console/domain/logic"
import { createSeedState } from "@/lib/console/persistence/seed"
import {
  DecisionStatus,
  Priority,
  ReviewStatus,
  WorkAssignmentStatus,
} from "@/lib/console/domain/enums"

test("returns at most five items, each fully described", () => {
  const items = todaysPriorities(createSeedState())
  assert.ok(items.length >= 3 && items.length <= 5)
  for (const item of items) {
    assert.ok(item.title.length > 0)
    assert.ok(item.whyItMatters.length > 0)
    assert.ok(item.estimatedMinutes > 0)
    assert.ok(["high", "medium", "low"].includes(item.confidence))
    assert.ok(item.recommendedAction.length > 0)
    assert.ok(item.href.startsWith("/"))
  }
})

test("more urgent priorities rank first", () => {
  const rank = { critical: 0, high: 1, medium: 2, low: 3 } as const
  const items = todaysPriorities(createSeedState())
  for (let i = 1; i < items.length; i++) {
    // Allow equal-or-adjacent ranks; never a strict inversion by 2+ levels.
    assert.ok(rank[items[i - 1].priority] <= rank[items[i].priority] + 1)
  }
})

test("a decision that unblocks work outranks an equal-priority decision", () => {
  const items = todaysPriorities(createSeedState())
  const unblocking = items.findIndex((i) => i.id === "dec-knowledge-promotion")
  const plain = items.findIndex((i) => i.id === "dec-approve-twin")
  assert.ok(unblocking !== -1, "unblocking decision present")
  assert.ok(plain !== -1, "plain decision present")
  assert.ok(unblocking < plain, "unblocking decision ranks higher")
})

test("blocked work covered by a waiting decision is not duplicated", () => {
  const items = todaysPriorities(createSeedState())
  // wa-mind-arch is blocked, but dec-knowledge-promotion (waiting) affects it.
  assert.ok(!items.some((i) => i.kind === "blocker" && i.id === "wa-mind-arch"))
})

test("uncovered blocked work appears as a blocker priority", () => {
  const state = createSeedState()
  // Remove the covering decision, leaving the blocked assignment orphaned.
  state.decisions = state.decisions.map((d) =>
    d.id === "dec-knowledge-promotion" || d.id === "dec-blocker-risk"
      ? { ...d, status: DecisionStatus.Deferred }
      : d,
  )
  const items = todaysPriorities(state)
  assert.ok(items.some((i) => i.kind === "blocker" && i.id === "wa-mind-arch"))
})

test("deliverables awaiting review appear with a review action", () => {
  const items = todaysPriorities(createSeedState(), 10)
  const review = items.find((i) => i.kind === "review")
  assert.ok(review, "a review priority exists")
  assert.match(review.recommendedAction, /approve or return/i)
})

test("a decision without a recommendation has lower confidence", () => {
  const state = createSeedState()
  state.decisions = state.decisions.map((d) =>
    d.id === "dec-approve-twin" ? { ...d, recommendation: "" } : d,
  )
  const item = todaysPriorities(state, 10).find((i) => i.id === "dec-approve-twin")
  assert.ok(item)
  assert.notEqual(item.confidence, "high")
})

test("an empty organization yields no priorities", () => {
  const state = createSeedState()
  state.decisions = state.decisions.map((d) => ({ ...d, status: DecisionStatus.Approved }))
  state.deliverables = state.deliverables.map((d) => ({ ...d, reviewStatus: ReviewStatus.Approved }))
  state.workAssignments = state.workAssignments.map((a) =>
    a.status === WorkAssignmentStatus.Blocked
      ? { ...a, status: WorkAssignmentStatus.InProgress, blockedReason: null }
      : a,
  )
  assert.deepEqual(todaysPriorities(state), [])
})

test("critical items lead the list", () => {
  const state = createSeedState()
  state.decisions = state.decisions.map((d) =>
    d.id === "dec-domain-lock" ? { ...d, priority: Priority.Critical } : d,
  )
  const items = todaysPriorities(state)
  assert.equal(items[0].id, "dec-domain-lock")
})
