/**
 * Project State Engine — application service.
 *
 * The only thing Executive Office pages and API routes call. Reads return the
 * derived briefing/agenda; mutations wrap pure transitions in engine
 * transactions.
 */

import "server-only"

import {
  beginSessionTx,
  getProjectEngine,
  resolveApprovalTx,
} from "./engine"
import { briefing, nextSessionTopic, sessionAgenda } from "./logic"
import type {
  ExecutiveApproval,
  ProjectBriefing,
  SessionAgenda,
  SessionRecord,
} from "@/types/project"

const now = () => new Date().toISOString()

export async function getProjectBriefing(): Promise<ProjectBriefing> {
  return briefing(await getProjectEngine().load())
}

export async function getSessionAgenda(): Promise<SessionAgenda | null> {
  return sessionAgenda(await getProjectEngine().load())
}

export async function beginSession(): Promise<SessionRecord | null> {
  const engine = getProjectEngine()
  const state = await engine.load()
  const topic = nextSessionTopic(state)
  if (!topic) return null
  return engine.transaction((s) =>
    beginSessionTx(s, { topicId: topic.id, at: now() }),
  )
}

export async function resolveApproval(
  id: string,
  resolution: "approved" | "deferred",
  rationale?: string,
): Promise<ExecutiveApproval> {
  return getProjectEngine().transaction((s) =>
    resolveApprovalTx(s, { id, resolution, rationale, at: now() }),
  )
}
