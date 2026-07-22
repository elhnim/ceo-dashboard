/**
 * Founder Console — persisted-state migration.
 *
 * Milestone 2 introduced Commitments and decision-workflow fields. Data files
 * written by earlier milestones lack them, so the repository runs every loaded
 * state through this deterministic, idempotent migration. No data is ever
 * discarded — only missing fields are filled with safe defaults.
 */

import { DecisionStage, DecisionStatus } from "@/lib/console/domain/enums"
import type { ConsoleState, Decision } from "@/types/console"

/** Map a pre-M2 decision (no workflow fields) onto the new shape. */
function migrateDecision(dec: Partial<Decision> & { id: string }): Decision {
  const status = dec.status ?? DecisionStatus.Waiting
  // Derive a stage for legacy rows: resolved-positive decisions are approved;
  // everything else sits at "ready" (they were already in front of the
  // Director under the old model).
  const stage =
    dec.stage ??
    (status === DecisionStatus.Approved || status === DecisionStatus.Modified
      ? DecisionStage.Approved
      : DecisionStage.Ready)
  const migrated = dec as Decision
  return {
    ...migrated,
    executiveSummary: dec.executiveSummary ?? dec.whyItMatters ?? "",
    risks: dec.risks ?? [],
    decisionOwnerId:
      dec.decisionOwnerId ?? dec.requestingOfficerAssignmentId ?? "oa-ea",
    dueDate: dec.dueDate ?? null,
    linkedCommitmentIds: dec.linkedCommitmentIds ?? [],
    stage,
  }
}

export function migrateState(raw: unknown): ConsoleState {
  const state = raw as ConsoleState
  return {
    ...state,
    commitments: state.commitments ?? [],
    decisions: (state.decisions ?? []).map((d) => migrateDecision(d)),
  }
}
