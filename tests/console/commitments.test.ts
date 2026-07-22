import assert from "node:assert/strict"
import { test } from "node:test"

import {
  createCommitmentTx,
  setCommitmentStatusTx,
  addCommitmentNoteTx,
  setDecisionStageTx,
  resolveDecisionTx,
  NotFoundError,
} from "@/lib/console/domain/transitions"
import { ValidationError } from "@/lib/console/domain/validation"
import { createSeedState } from "@/lib/console/persistence/seed"
import { migrateState } from "@/lib/console/persistence/migrate"
import {
  activeCommitments,
  averageConfidence,
  awaitingVerification,
  commitmentsForOfficer,
  deliveryScore,
  emergingRisks,
  focusToday,
  healthSignal,
  isOverdue,
  momentum,
  officerWorkload,
  waitingForMe,
} from "@/lib/console/domain/logic"
import {
  ActivityEventType,
  CommitmentStatus,
  DecisionStage,
  DecisionAction,
  enumValues,
} from "@/lib/console/domain/enums"
import { validateConsoleState } from "@/lib/console/domain/validation"

const AT = "2026-07-21T08:00:00.000Z"
const NOW = "2026-07-21T06:00:00.000Z"

// --- Seed content -------------------------------------------------------------

test("seed commitments cover every lifecycle status", () => {
  const s = createSeedState()
  const present = new Set(s.commitments.map((c) => c.status))
  for (const status of enumValues(CommitmentStatus)) {
    assert.ok(present.has(status), `expected a ${status} commitment`)
  }
})

test("seed contains an overdue commitment and passes validation", () => {
  const s = createSeedState()
  assert.ok(s.commitments.some((c) => isOverdue(c, NOW)))
  assert.deepEqual(validateConsoleState(s), [])
})

// --- Creation ------------------------------------------------------------------

test("delegation creates a committed commitment and logs activity", () => {
  const { state, result } = createCommitmentTx(createSeedState(), {
    id: "cm-new",
    at: AT,
    data: {
      title: "Ship the weekly digest",
      outcome: "A digest the Director reads every Friday",
      ownerOfficerAssignmentId: "oa-ea",
    },
  })
  assert.equal(result.status, CommitmentStatus.Committed)
  assert.equal(result.requestedById, "oa-minh")
  assert.equal(state.activity.at(-1)?.eventType, ActivityEventType.CommitmentCreated)
})

test("asDraft creates a draft", () => {
  const { result } = createCommitmentTx(createSeedState(), {
    id: "cm-d",
    at: AT,
    data: {
      title: "T",
      outcome: "O",
      ownerOfficerAssignmentId: "oa-pm",
      asDraft: true,
    },
  })
  assert.equal(result.status, CommitmentStatus.Draft)
})

test("a commitment always requires an owner", () => {
  assert.throws(
    () =>
      createCommitmentTx(createSeedState(), {
        id: "cm-x",
        at: AT,
        data: { title: "T", outcome: "O", ownerOfficerAssignmentId: "" },
      }),
    ValidationError,
  )
  assert.throws(
    () =>
      createCommitmentTx(createSeedState(), {
        id: "cm-x",
        at: AT,
        data: { title: "T", outcome: "O", ownerOfficerAssignmentId: "oa-ghost" },
      }),
    NotFoundError,
  )
})

// --- Lifecycle ------------------------------------------------------------------

test("legal lifecycle transitions succeed and stamp timestamps", () => {
  let state = createSeedState()
  let r = setCommitmentStatusTx(state, {
    id: "cm-authority-model",
    status: CommitmentStatus.InProgress,
    at: AT,
  })
  state = r.state
  assert.equal(r.result.status, CommitmentStatus.InProgress)

  r = setCommitmentStatusTx(state, {
    id: "cm-authority-model",
    status: CommitmentStatus.Completed,
    at: AT,
  })
  state = r.state
  assert.equal(r.result.completedAt, AT)
  assert.equal(state.activity.at(-1)?.eventType, ActivityEventType.CommitmentCompleted)

  r = setCommitmentStatusTx(state, {
    id: "cm-authority-model",
    status: CommitmentStatus.Verified,
    at: AT,
  })
  assert.equal(r.result.verifiedAt, AT)
  assert.equal(r.state.activity.at(-1)?.eventType, ActivityEventType.CommitmentVerified)
})

test("illegal transitions are rejected", () => {
  // Draft cannot jump to completed.
  assert.throws(
    () =>
      setCommitmentStatusTx(createSeedState(), {
        id: "cm-change-prop",
        status: CommitmentStatus.Completed,
        at: AT,
      }),
    ValidationError,
  )
  // Verified is terminal.
  assert.throws(
    () =>
      setCommitmentStatusTx(createSeedState(), {
        id: "cm-council-rhythm",
        status: CommitmentStatus.InProgress,
        at: AT,
      }),
    ValidationError,
  )
})

test("blocking requires a reason; unblocking logs an event", () => {
  assert.throws(
    () =>
      setCommitmentStatusTx(createSeedState(), {
        id: "cm-outcome-map",
        status: CommitmentStatus.Blocked,
        at: AT,
      }),
    ValidationError,
  )
  const blocked = setCommitmentStatusTx(createSeedState(), {
    id: "cm-outcome-map",
    status: CommitmentStatus.Blocked,
    reason: "Waiting on the Organization Model",
    at: AT,
  })
  assert.equal(blocked.result.blockedReason, "Waiting on the Organization Model")
  const unblocked = setCommitmentStatusTx(blocked.state, {
    id: "cm-outcome-map",
    status: CommitmentStatus.InProgress,
    at: AT,
  })
  assert.equal(unblocked.result.blockedReason, null)
  assert.equal(
    unblocked.state.activity.at(-1)?.eventType,
    ActivityEventType.CommitmentUnblocked,
  )
})

test("notes append with author and time", () => {
  const { result } = addCommitmentNoteTx(createSeedState(), {
    id: "cm-outcome-map",
    note: "Taxonomy layer aligned.",
    author: "Minh",
    at: AT,
  })
  assert.equal(result.notes.at(-1)?.note, "Taxonomy layer aligned.")
})

// --- Officer management ---------------------------------------------------------

test("officer workload counts open commitments and active work", () => {
  const s = createSeedState()
  // Vera (oa-ea): commitments cm-brief-quality (in-progress) + assignments in flight.
  assert.ok(officerWorkload(s, "oa-ea") >= 1)
  // The Director owns no commitments in seed.
  assert.equal(officerWorkload(s, "oa-minh"), 0)
})

test("average confidence reflects active commitments only", () => {
  const s = createSeedState()
  const theo = averageConfidence(s, "oa-cka")
  assert.ok(theo)
  assert.equal(theo.level, "medium")
  assert.equal(averageConfidence(s, "oa-minh"), null)
})

test("delivery score is the on-time share of concluded commitments", () => {
  const s = createSeedState()
  // Vera concluded 2 (council rhythm due 07-15 completed 07-14 on time;
  // decision framework due 07-21 completed 07-21T04:55 on time).
  const vera = deliveryScore(s, "oa-ea")
  assert.ok(vera)
  assert.equal(vera.concluded, 2)
  assert.equal(vera.score, 100)
  // No concluded commitments → null, never a fabricated score.
  assert.equal(deliveryScore(s, "oa-pm"), null)
})

test("late delivery lowers the score", () => {
  const s = createSeedState()
  s.commitments = s.commitments.map((c) =>
    c.id === "cm-council-rhythm"
      ? { ...c, completedAt: "2026-07-16T00:00:00.000Z" } // due 07-15 → late
      : c,
  )
  const vera = deliveryScore(s, "oa-ea")
  assert.ok(vera)
  assert.equal(vera.score, 50)
})

test("commitmentsForOfficer groups active, completed, blocked, overdue", () => {
  const s = createSeedState()
  const theo = commitmentsForOfficer(s, "oa-cka", NOW)
  assert.equal(theo.blocked.length, 1)
  assert.equal(theo.active.length, 1)
})

// --- Brief 2.0 -------------------------------------------------------------------

test("focus today leads with blocked, then overdue", () => {
  const items = focusToday(createSeedState(), NOW)
  assert.ok(items.length > 0)
  assert.equal(items[0].status, CommitmentStatus.Blocked)
  assert.ok(isOverdue(items[1], NOW))
})

test("waiting for me includes decisions, deliverables, and verifications", () => {
  const kinds = new Set(waitingForMe(createSeedState()).map((i) => i.kind))
  assert.ok(kinds.has("decision"))
  assert.ok(kinds.has("deliverable"))
  assert.ok(kinds.has("verification"))
})

test("emerging risks flag overdue commitments, blocks, and delayed decisions", () => {
  const kinds = new Set(emergingRisks(createSeedState(), NOW).map((r) => r.kind))
  assert.ok(kinds.has("overdue-commitment"))
  assert.ok(kinds.has("blocked-commitment"))
  assert.ok(kinds.has("delayed-decision"))
})

test("momentum counts conclusions since the prior brief", () => {
  const s = createSeedState()
  const m = momentum(s, "2026-07-20T18:00:00.000Z")
  assert.ok(m.commitmentsCompleted >= 1)
  assert.ok(m.commitmentsVerified >= 1)
})

test("health signal maps to a traffic light", () => {
  const { color } = healthSignal(createSeedState(), NOW)
  assert.equal(color, "yellow")
})

test("active commitments and awaiting verification are distinct sets", () => {
  const s = createSeedState()
  const active = activeCommitments(s)
  const verify = awaitingVerification(s)
  assert.ok(active.length >= 3)
  assert.ok(verify.length >= 1)
  assert.ok(!active.some((c) => verify.some((v) => v.id === c.id)))
})

// --- Decision workflow ------------------------------------------------------------

test("approving a decision advances its stage to approved", () => {
  const { result } = resolveDecisionTx(createSeedState(), {
    id: "dec-approve-twin",
    action: DecisionAction.Approve,
    at: AT,
  })
  assert.equal(result.stage, DecisionStage.Approved)
})

test("decision stages advance in order and reject jumps", () => {
  let state = createSeedState()
  const approved = resolveDecisionTx(state, {
    id: "dec-approve-twin",
    action: DecisionAction.Approve,
    at: AT,
  })
  state = approved.state
  const executed = setDecisionStageTx(state, {
    id: "dec-approve-twin",
    stage: DecisionStage.Executed,
    at: AT,
  })
  assert.equal(executed.result.stage, DecisionStage.Executed)
  const verified = setDecisionStageTx(executed.state, {
    id: "dec-approve-twin",
    stage: DecisionStage.Verified,
    at: AT,
  })
  assert.equal(verified.result.stage, DecisionStage.Verified)
  // Jumping ready → verified is illegal.
  assert.throws(
    () =>
      setDecisionStageTx(createSeedState(), {
        id: "dec-knowledge-promotion",
        stage: DecisionStage.Verified,
        at: AT,
      }),
    ValidationError,
  )
})

// --- Migration ---------------------------------------------------------------------

test("pre-M2 data files migrate cleanly", () => {
  const legacy = createSeedState() as unknown as Record<string, unknown>
  // Simulate an M1.1-era file: no commitments, decisions without workflow fields.
  delete legacy.commitments
  legacy.decisions = (legacy.decisions as Array<Record<string, unknown>>).map((d) => {
    const copy = { ...d }
    delete copy.stage
    delete copy.executiveSummary
    delete copy.risks
    delete copy.decisionOwnerId
    delete copy.dueDate
    delete copy.linkedCommitmentIds
    return copy
  })

  const migrated = migrateState(legacy)
  assert.deepEqual(migrated.commitments, [])
  for (const d of migrated.decisions) {
    assert.ok(d.stage, "stage filled")
    assert.ok(Array.isArray(d.risks))
    assert.ok(Array.isArray(d.linkedCommitmentIds))
    assert.equal(typeof d.executiveSummary, "string")
  }
  // Approved legacy decisions land in the approved stage.
  const framework = migrated.decisions.find((d) => d.id === "dec-approve-framework")
  assert.equal(framework?.stage, DecisionStage.Approved)
  // The migrated state passes full validation.
  assert.deepEqual(validateConsoleState(migrated), [])
})
