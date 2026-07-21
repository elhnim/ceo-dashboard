import assert from "node:assert/strict"
import { test } from "node:test"

import { createSeedState } from "@/lib/console/persistence/seed"
import { validateConsoleState } from "@/lib/console/domain/validation"
import {
  DecisionType,
  WorkAssignmentStatus,
  enumValues,
} from "@/lib/console/domain/enums"

test("seed passes full referential-integrity validation", () => {
  const issues = validateConsoleState(createSeedState())
  assert.deepEqual(issues, [], `expected no issues, got: ${issues.join("; ")}`)
})

test("seed meets the required content minimums", () => {
  const s = createSeedState()
  const aiOfficers = s.officerAssignments.filter((o) => o.roleId !== "role-director")
  assert.equal(aiOfficers.length, 5, "five founding officers")
  assert.ok(s.workAssignments.length >= 8, "at least eight assignments")
  assert.ok(s.deliverables.length >= 4, "at least four deliverables")
  assert.ok(s.decisions.length >= 5, "at least five decisions")
  assert.ok(s.activity.length >= 5, "an activity timeline")
  assert.ok(s.briefs.length >= 1, "a morning brief")
})

test("seed exercises the full spread of work statuses", () => {
  const s = createSeedState()
  const present = new Set(s.workAssignments.map((a) => a.status))
  for (const status of [
    WorkAssignmentStatus.InProgress,
    WorkAssignmentStatus.Blocked,
    WorkAssignmentStatus.Review,
    WorkAssignmentStatus.Completed,
  ]) {
    assert.ok(present.has(status), `expected a ${status} assignment`)
  }
})

test("seed covers every decision type", () => {
  const s = createSeedState()
  const present = new Set(s.decisions.map((d) => d.type))
  for (const type of enumValues(DecisionType)) {
    assert.ok(present.has(type), `expected a decision of type ${type}`)
  }
})

test("blocked assignments always carry a reason", () => {
  const s = createSeedState()
  for (const a of s.workAssignments.filter((x) => x.status === WorkAssignmentStatus.Blocked)) {
    assert.ok(a.blockedReason && a.blockedReason.length > 0)
  }
})
