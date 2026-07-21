/**
 * Founder Console — integration boundary.
 *
 * These interfaces are the clean seam between Founder Console's domain and the
 * outside world (AI models, notifications, source control, deployment, etc.).
 * The MVP ships local/mock adapters only. Real vendors (Anthropic, OpenAI,
 * GitHub, Netlify, a knowledge store, …) are wired in later by implementing
 * these interfaces — domain logic never imports a vendor SDK directly.
 */

import type { ConsoleState } from "@/types/console"

/** A single message in an EA conversation. */
export interface ProviderMessage {
  role: "director" | "ea"
  text: string
}

export interface ConversationReply {
  text: string
  /** Optional structured intent the deterministic engine matched. */
  intent?: string
}

/**
 * Turns Director input into an EA reply. The MVP adapter is deterministic and
 * reads the live ConsoleState; a real model adapter would call an LLM.
 */
export interface ConversationProvider {
  readonly name: string
  reply(input: {
    message: string
    history: ProviderMessage[]
    state: ConsoleState
  }): Promise<ConversationReply>
}

/**
 * Represents a real AI officer/worker execution backend (Claude Code, Codex,
 * Pi, …). Not implemented in the MVP — assignments are simulated through seed
 * data and manual state transitions. Present so the wiring point is explicit.
 */
export interface AgentProvider {
  readonly name: string
  /** Dispatch an assignment to an underlying agent session. */
  dispatch(input: {
    assignmentId: string
    instructions: string
  }): Promise<{ sessionRef: string }>
  /** Fetch a status snapshot for a dispatched assignment. */
  status(sessionRef: string): Promise<{ state: string; note?: string }>
}

export interface NotificationProvider {
  readonly name: string
  notify(input: {
    title: string
    body: string
    priority: "low" | "normal" | "high"
  }): Promise<void>
}

export interface VoiceProvider {
  readonly name: string
  /** Placeholder — voice is explicitly out of scope for the MVP. */
  readonly enabled: boolean
}

export interface SourceControlProvider {
  readonly name: string
  /** Placeholder for future GitHub/GitLab integration. */
  linkForEvidence(ref: string): string
}

export interface KnowledgeProvider {
  readonly name: string
  /** Placeholder for the future Organizational Mind retrieval layer. */
  search(query: string): Promise<Array<{ title: string; href: string }>>
}

export interface DeploymentProvider {
  readonly name: string
  /** Placeholder for future deployment automation. */
  readonly enabled: boolean
}

/** The set of adapters the application is running with. */
export interface IntegrationRegistry {
  conversation: ConversationProvider
  agent: AgentProvider | null
  notification: NotificationProvider
  voice: VoiceProvider
  sourceControl: SourceControlProvider
  knowledge: KnowledgeProvider
  deployment: DeploymentProvider
}
