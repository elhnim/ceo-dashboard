import assert from "node:assert/strict"
import { test } from "node:test"

import {
  DECISION_ACTION_RESULT,
  DecisionAction,
  DecisionActionLabel,
  DecisionStatus,
  DecisionType,
  DecisionTypeLabel,
  DeliverableType,
  DeliverableTypeLabel,
  PRIORITY_RANK,
  Priority,
  PriorityLabel,
  WORK_ASSIGNMENT_STATUS_ORDER,
  WorkAssignmentStatus,
  WorkAssignmentStatusLabel,
  enumValues,
} from "@/lib/console/domain/enums"

test("every priority has a rank and a label", () => {
  for (const p of enumValues(Priority)) {
    assert.equal(typeof PRIORITY_RANK[p], "number")
    assert.equal(typeof PriorityLabel[p], "string")
  }
})

test("priority ranks are strictly ordered critical < high < medium < low", () => {
  assert.ok(PRIORITY_RANK.critical < PRIORITY_RANK.high)
  assert.ok(PRIORITY_RANK.high < PRIORITY_RANK.medium)
  assert.ok(PRIORITY_RANK.medium < PRIORITY_RANK.low)
})

test("work status order contains every status exactly once", () => {
  const values = enumValues(WorkAssignmentStatus)
  assert.equal(WORK_ASSIGNMENT_STATUS_ORDER.length, values.length)
  assert.deepEqual(new Set(WORK_ASSIGNMENT_STATUS_ORDER), new Set(values))
})

test("every enum value has a label", () => {
  for (const s of enumValues(WorkAssignmentStatus))
    assert.equal(typeof WorkAssignmentStatusLabel[s], "string")
  for (const t of enumValues(DeliverableType))
    assert.equal(typeof DeliverableTypeLabel[t], "string")
  for (const t of enumValues(DecisionType))
    assert.equal(typeof DecisionTypeLabel[t], "string")
  for (const a of enumValues(DecisionAction))
    assert.equal(typeof DecisionActionLabel[a], "string")
})

test("every decision action maps to a resolution status", () => {
  for (const a of enumValues(DecisionAction)) {
    const result = DECISION_ACTION_RESULT[a]
    assert.ok(enumValues(DecisionStatus).includes(result))
  }
  assert.equal(DECISION_ACTION_RESULT.approve, DecisionStatus.Approved)
  assert.equal(DECISION_ACTION_RESULT.reject, DecisionStatus.Rejected)
})
