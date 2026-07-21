import assert from "node:assert/strict"
import { test } from "node:test"

import {
  validateDecision,
  validateDeliverable,
  validateWorkAssignment,
} from "@/lib/console/domain/validation"
import {
  DecisionType,
  DeliverableType,
  Priority,
  WorkAssignmentStatus,
} from "@/lib/console/domain/enums"

test("work assignment requires title, objective, owner", () => {
  const issues = validateWorkAssignment({})
  assert.ok(issues.some((i) => i.includes("title")))
  assert.ok(issues.some((i) => i.includes("objective")))
  assert.ok(issues.some((i) => i.includes("ownerOfficerAssignmentId")))
})

test("valid work assignment produces no issues", () => {
  const issues = validateWorkAssignment({
    title: "X",
    objective: "Y",
    ownerOfficerAssignmentId: "oa-pm",
    priority: Priority.High,
  })
  assert.deepEqual(issues, [])
})

test("blocked status requires a reason", () => {
  const issues = validateWorkAssignment({
    title: "X",
    objective: "Y",
    ownerOfficerAssignmentId: "oa-pm",
    status: WorkAssignmentStatus.Blocked,
  })
  assert.ok(issues.some((i) => i.includes("blockedReason")))
})

test("decision requires a valid type and whyItMatters", () => {
  const issues = validateDecision({ title: "T", priority: Priority.Low })
  assert.ok(issues.some((i) => i.includes("type")))
  assert.ok(issues.some((i) => i.includes("whyItMatters")))
})

test("valid decision produces no issues", () => {
  const issues = validateDecision({
    title: "T",
    type: DecisionType.Approval,
    priority: Priority.Low,
    whyItMatters: "because",
    estimatedDecisionMinutes: 5,
  })
  assert.deepEqual(issues, [])
})

test("deliverable requires a valid type and assignment", () => {
  const issues = validateDeliverable({ title: "D" })
  assert.ok(issues.some((i) => i.includes("type")))
  assert.ok(issues.some((i) => i.includes("assignmentId")))
})

test("negative decision minutes are rejected", () => {
  const issues = validateDecision({
    title: "T",
    type: DecisionType.Approval,
    priority: Priority.Low,
    whyItMatters: "x",
    estimatedDecisionMinutes: -3,
  })
  assert.ok(issues.some((i) => i.includes("estimatedDecisionMinutes")))
})

test("deliverable version must be positive", () => {
  const issues = validateDeliverable({
    title: "D",
    type: DeliverableType.Report,
    assignmentId: "wa-1",
    version: 0,
  })
  assert.ok(issues.some((i) => i.includes("version")))
})
