/**
 * Project State Engine — persistence and mutations.
 *
 * Same architecture as the console: a repository port over a local JSON file
 * (seeded with the real program), serialized transactions, and pure
 * transition functions. The Executive Office mutates project state only
 * through these operations; curated facts evolve via ordinary commits to the
 * seed.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"

import { createProjectSeed } from "./seed"
import type {
  ExecutiveApproval,
  ProjectState,
  SessionRecord,
} from "@/types/project"

function resolveDataDir(): string {
  if (process.env.FOUNDER_CONSOLE_DATA_DIR) return process.env.FOUNDER_CONSOLE_DATA_DIR
  if (process.env.NETLIFY || process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)
    return path.join(os.tmpdir(), "founder-console")
  return path.join(process.cwd(), ".data")
}

const DATA_FILE = path.join(resolveDataDir(), "founder-console-project.json")

const logKey = (e: { at: string; title: string }) => `${e.at}|${e.title}`

/**
 * The seed is the curated source of truth for program FACTS; the data file
 * only accumulates runtime mutations (sessions held, approvals resolved, log
 * entries appended). Merging keeps every panel current after each engineering
 * cycle without manual resets.
 */
export function mergeSeedWithRuntime(runtime: Partial<ProjectState>): ProjectState {
  const seed = createProjectSeed()
  const resolved = new Map(
    (runtime.approvals ?? [])
      .filter((a) => a.status !== "open")
      .map((a) => [a.id, a]),
  )
  const seedLogKeys = new Set(seed.log.map(logKey))
  const runtimeLog = (runtime.log ?? []).filter((e) => !seedLogKeys.has(logKey(e)))
  return {
    ...seed,
    approvals: seed.approvals.map((a) => resolved.get(a.id) ?? a),
    log: [...seed.log, ...runtimeLog],
    sessions: runtime.sessions ?? [],
  }
}

export class ProjectEngine {
  private queue: Promise<unknown> = Promise.resolve()

  async load(): Promise<ProjectState> {
    try {
      const raw = await readFile(DATA_FILE, "utf8")
      return mergeSeedWithRuntime(JSON.parse(raw) as Partial<ProjectState>)
    } catch {
      return mergeSeedWithRuntime({})
    }
  }

  private async save(state: ProjectState): Promise<void> {
    await mkdir(path.dirname(DATA_FILE), { recursive: true })
    // Persist only runtime mutations; facts stay in the versioned seed.
    const seedLogKeys = new Set(createProjectSeed().log.map(logKey))
    const runtime = {
      approvals: state.approvals,
      sessions: state.sessions,
      log: state.log.filter((e) => !seedLogKeys.has(logKey(e))),
    }
    await writeFile(DATA_FILE, JSON.stringify(runtime, null, 2), "utf8")
  }

  transaction<T>(
    fn: (state: ProjectState) => { state: ProjectState; result: T },
  ): Promise<T> {
    const run = this.queue.then(async () => {
      const current = await this.load()
      const { state, result } = fn(structuredClone(current))
      await this.save(state)
      return result
    })
    this.queue = run.then(
      () => undefined,
      () => undefined,
    )
    return run
  }
}

let engine: ProjectEngine | null = null
export function getProjectEngine(): ProjectEngine {
  if (!engine) engine = new ProjectEngine()
  return engine
}

// --- Pure transitions ----------------------------------------------------------

export function resolveApprovalTx(
  state: ProjectState,
  input: { id: string; resolution: "approved" | "deferred"; rationale?: string; at: string },
): { state: ProjectState; result: ExecutiveApproval } {
  const approval = state.approvals.find((a) => a.id === input.id)
  if (!approval) throw new Error(`Approval not found: ${input.id}`)
  if (approval.status !== "open")
    throw new Error(`Approval ${input.id} is already ${approval.status}`)

  const resolved: ExecutiveApproval = {
    ...approval,
    status: input.resolution,
    resolvedAt: input.at,
    rationale: input.rationale ?? null,
  }
  return {
    state: {
      ...state,
      approvals: state.approvals.map((a) => (a.id === resolved.id ? resolved : a)),
      log: [
        ...state.log,
        {
          at: input.at,
          kind: "decision",
          title: `${input.resolution === "approved" ? "Approved" : "Deferred"}: ${approval.title}`,
          detail: input.rationale ?? approval.detail,
        },
      ],
    },
    result: resolved,
  }
}

export function beginSessionTx(
  state: ProjectState,
  input: { topicId: string; at: string },
): { state: ProjectState; result: SessionRecord } {
  const record: SessionRecord = { startedAt: input.at, topicId: input.topicId }
  return {
    state: {
      ...state,
      sessions: [...state.sessions, record],
      log: [
        ...state.log,
        {
          at: input.at,
          kind: "architecture",
          title: "Executive session begun",
          detail: `Topic: ${input.topicId}`,
        },
      ],
    },
    result: record,
  }
}
