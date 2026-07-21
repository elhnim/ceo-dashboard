import assert from "node:assert/strict"
import { test } from "node:test"

import {
  createWorkAssignmentTx,
  resolveDecisionTx,
  reviewDeliverableTx,
  setWorkStatusTx,
  NotFoundError,
} from "@/lib/console/domain/transitions"
import { ValidationError } from "@/lib/console/domain/validation"
import { createSeedState } from "@/lib/console/persistence/seed"
import {
  ActivityEventType,
  DecisionAction,
  DecisionStatus,
  ReviewStatus,
  WorkAssignmentStatus,
} from "@/lib/console/domain/enums"

const AT = "2026-07-21T08:00:00.000Z"

test("approving a decision records resolution and activity", () => {
  const { state, result } = resolveDecisionTx(createSeedState(), {
    id: "dec-approve-twin",
    action: DecisionAction.Approve,
    rationale: "Looks good",
    at: AT,
  })
  assert.equal(result.status, DecisionStatus.Approved)
  assert.equal(result.resolution, "approve")
  assert.equal(result.rationale, "Looks good")
  assert.equal(result.decidedAt, AT)
  const event = state.activity.at(-1)
  assert.equal(event?.eventType, ActivityEventType.DecisionResolved)
})

test("approving a constitutional decision records a constitutional event", () => {
  const { state } = resolveDecisionTx(createSeedState(), {
    id: "dec-ten-year-rule",
    action: DecisionAction.Approve,
    at: AT,
  })
  assert.equal(state.activity.at(-1)?.eventType, ActivityEventType.ConstitutionalDecision)
})

test("resolving a missing decision throws NotFoundError", () => {
  assert.throws(
    () => resolveDecisionTx(createSeedState(), { id: "nope", action: DecisionAction.Approve, at: AT }),
    NotFoundError,
  )
})

test("approving a submitted deliverable approves its assignment", () => {
  const { state, result } = reviewDeliverableTx(createSeedState(), {
    id: "del-twin-spec",
    outcome: "approve",
    comment: "Approved",
    author: "Minh",
    at: AT,
  })
  assert.equal(result.reviewStatus, ReviewStatus.Approved)
  const assignment = state.workAssignments.find((a) => a.id === "wa-twin-spec")
  assert.equal(assignment?.status, WorkAssignmentStatus.Approved)
  assert.equal(state.activity.at(-1)?.eventType, ActivityEventType.DeliverableApproved)
})

test("requesting revision returns the assignment to in-progress", () => {
  const { state, result } = reviewDeliverableTx(createSeedState(), {
    id: "del-twin-spec",
    outcome: "request-revision",
    comment: "Please expand versioning",
    author: "Minh",
    at: AT,
  })
  assert.equal(result.reviewStatus, ReviewStatus.RevisionRequested)
  const assignment = state.workAssignments.find((a) => a.id === "wa-twin-spec")
  assert.equal(assignment?.status, WorkAssignmentStatus.InProgress)
  assert.equal(state.activity.at(-1)?.eventType, ActivityEventType.DeliverableReturned)
})

test("creating a work assignment starts it as proposed and logs activity", () => {
  const { state, result } = createWorkAssignmentTx(createSeedState(), {
    id: "wa-new",
    at: AT,
    data: {
      title: "New charter",
      objective: "Draft the charter",
      ownerOfficerAssignmentId: "oa-pm",
    },
  })
  assert.equal(result.status, WorkAssignmentStatus.Proposed)
  assert.ok(state.workAssignments.some((a) => a.id === "wa-new"))
  assert.equal(state.activity.at(-1)?.eventType, ActivityEventType.AssignmentCreated)
})

test("creating a work assignment with an unknown owner throws", () => {
  assert.throws(
    () =>
      createWorkAssignmentTx(createSeedState(), {
        id: "wa-x",
        at: AT,
        data: { title: "T", objective: "O", ownerOfficerAssignmentId: "oa-ghost" },
      }),
    NotFoundError,
  )
})

test("blocking an assignment requires a reason and logs a blocked event", () => {
  assert.throws(
    () => setWorkStatusTx(createSeedState(), { id: "wa-outcome-map", status: WorkAssignmentStatus.Blocked, at: AT }),
    ValidationError,
  )
  const { state, result } = setWorkStatusTx(createSeedState(), {
    id: "wa-outcome-map",
    status: WorkAssignmentStatus.Blocked,
    reason: "Waiting on API access",
    at: AT,
  })
  assert.equal(result.status, WorkAssignmentStatus.Blocked)
  assert.equal(result.blockedReason, "Waiting on API access")
  assert.equal(state.activity.at(-1)?.eventType, ActivityEventType.OfficerBlocked)
})

test("unblocking an assignment logs an unblocked event and clears the reason", () => {
  const { state, result } = setWorkStatusTx(createSeedState(), {
    id: "wa-mind-arch",
    status: WorkAssignmentStatus.InProgress,
    at: AT,
  })
  assert.equal(result.status, WorkAssignmentStatus.InProgress)
  assert.equal(result.blockedReason, null)
  assert.equal(state.activity.at(-1)?.eventType, ActivityEventType.OfficerUnblocked)
})
