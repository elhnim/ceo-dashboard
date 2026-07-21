/**
 * Founder Console — deterministic Executive Assistant engine.
 *
 * Implements `ConversationProvider` with pure, seeded logic that reads live
 * ConsoleState. It matches the Director's message to an intent and composes a
 * calm, plain-language reply. Swapping in a real model later means providing a
 * different ConversationProvider — nothing else in the app changes.
 */

import {
  allOfficerSummaries,
  blockedAssignments,
  computeMetrics,
  deriveHealth,
  officerSummary,
  readyDeliverables,
  waitingDecisions,
} from "@/lib/console/domain/logic"
import {
  DecisionTypeLabel,
  OrganizationHealthLabel,
  PriorityLabel,
  WorkAssignmentStatusLabel,
} from "@/lib/console/domain/enums"
import type {
  ConversationProvider,
  ConversationReply,
} from "@/lib/console/integrations/providers"
import type { ConsoleState } from "@/types/console"

type Intent =
  | "update"
  | "attention"
  | "blocked"
  | "officer-work"
  | "create-assignment"
  | "morning-brief"
  | "help"
  | "unknown"

interface Match {
  intent: Intent
  officerQuery?: string
}

/** The five founding officers, keyed for name/role matching in EA queries. */
// Generic title words that don't identify a single officer on their own.
const TITLE_STOPWORDS = new Set(["product", "chief", "officer", "the"])

function findOfficerByPhrase(
  state: ConsoleState,
  phrase: string,
): string | null {
  const lower = phrase.toLowerCase()
  const summaries = allOfficerSummaries(state)

  // Pass 1: an exact name or full role-title mention wins, regardless of order.
  for (const summary of summaries) {
    const name = summary.person.name.toLowerCase()
    const title = summary.role.title.toLowerCase()
    if (lower.includes(name) || lower.includes(title))
      return summary.officerAssignment.id
  }

  // Pass 2: fall back to distinctive (non-generic) role keywords.
  for (const summary of summaries) {
    const keywords = summary.role.title
      .toLowerCase()
      .split(/[^a-z]+/)
      .filter((w) => w.length > 3 && !TITLE_STOPWORDS.has(w))
    if (keywords.some((k) => lower.includes(k)))
      return summary.officerAssignment.id
  }
  return null
}

export function matchIntent(message: string, state: ConsoleState): Match {
  const m = message.toLowerCase().trim()

  if (/morning brief|prepare my brief|prepare.*brief/.test(m))
    return { intent: "morning-brief" }
  if (/(create|add|assign).*(assignment|work|task)/.test(m))
    return { intent: "create-assignment", officerQuery: message }
  if (/block(ed|ers)?/.test(m)) return { intent: "blocked" }
  if (/need|attention|decide|decision|waiting/.test(m))
    return { intent: "attention" }
  if (/working on|status of|what is|what's|doing/.test(m)) {
    const officer = findOfficerByPhrase(state, message)
    if (officer) return { intent: "officer-work", officerQuery: message }
  }
  if (/update|summary|overview|how are we|status/.test(m))
    return { intent: "update" }
  if (/help|what can you|commands/.test(m)) return { intent: "help" }

  // Fall back to officer lookup if a name/role is present anywhere.
  if (findOfficerByPhrase(state, message))
    return { intent: "officer-work", officerQuery: message }

  return { intent: "unknown" }
}

function updateReply(state: ConsoleState): string {
  const m = computeMetrics(state)
  const health = deriveHealth(state)
  const lines = [
    `Organization status is **${OrganizationHealthLabel[health]}**.`,
    "",
    `- ${m.officersActive} officers active`,
    `- ${m.assignmentsInProgress} assignments in progress`,
    `- ${m.deliverablesReady} deliverables ready for review`,
    `- ${m.decisionsWaiting} decisions waiting on you`,
    `- ${m.blockedAssignments} blocked`,
    `- ${m.workCompletedSinceLastBrief} completed since the last brief`,
  ]
  return lines.join("\n")
}

function attentionReply(state: ConsoleState): string {
  const decisions = waitingDecisions(state)
  const ready = readyDeliverables(state)
  if (decisions.length === 0 && ready.length === 0)
    return "Nothing needs your judgment right now. The Council is progressing cleanly."

  const lines: string[] = []
  if (decisions.length > 0) {
    lines.push(`**${decisions.length} decision${decisions.length > 1 ? "s" : ""} waiting**, most urgent first:`)
    for (const d of decisions.slice(0, 5))
      lines.push(
        `- [${PriorityLabel[d.priority]}] ${d.title} — ${DecisionTypeLabel[d.type]} (~${d.estimatedDecisionMinutes} min)`,
      )
  }
  if (ready.length > 0) {
    lines.push("")
    lines.push(`**${ready.length} deliverable${ready.length > 1 ? "s" : ""} ready for review:**`)
    for (const d of ready.slice(0, 5)) lines.push(`- ${d.title}`)
  }
  return lines.join("\n")
}

function blockedReply(state: ConsoleState): string {
  const blocked = blockedAssignments(state)
  if (blocked.length === 0)
    return "No work is blocked. Everything in flight has a clear path."
  const lines = [`**${blocked.length} blocked assignment${blocked.length > 1 ? "s" : ""}:**`]
  for (const a of blocked)
    lines.push(`- ${a.title}${a.blockedReason ? ` — ${a.blockedReason}` : ""}`)
  return lines.join("\n")
}

function officerReply(state: ConsoleState, match: Match): string {
  const officerId = findOfficerByPhrase(state, match.officerQuery ?? "")
  if (!officerId) return "I couldn't tell which officer you mean."
  const s = officerSummary(state, officerId)
  if (!s) return "I couldn't find that officer."

  const lines = [
    `**${s.person.name} — ${s.role.title}**`,
    s.role.mission,
    "",
  ]
  if (s.currentAssignments.length === 0) {
    lines.push("No active assignments right now.")
  } else {
    lines.push("Currently:")
    for (const a of s.currentAssignments)
      lines.push(`- ${a.title} (${WorkAssignmentStatusLabel[a.status]})`)
  }
  if (s.isBlocked) lines.push("\n⚠️ This officer is currently blocked.")
  return lines.join("\n")
}

function createAssignmentReply(state: ConsoleState, match: Match): string {
  const officerId = findOfficerByPhrase(state, match.officerQuery ?? "")
  const who = officerId
    ? officerSummary(state, officerId)?.person.name ?? "that officer"
    : "an officer"
  return [
    `To create an assignment for ${who}, open **Work → New assignment** (or an officer's detail page → **Assign work**).`,
    "",
    "In this MVP I prepare and route assignments; creating one is a Director action so the objective and acceptance criteria are yours to set. Tell me the objective and I'll draft acceptance criteria you can approve.",
  ].join("\n")
}

function morningBriefReply(state: ConsoleState): string {
  const m = computeMetrics(state)
  const health = deriveHealth(state)
  const decisions = waitingDecisions(state)
  const blocked = blockedAssignments(state)
  const lines = [
    `Good morning, Minh. Here's where the organization stands — **${OrganizationHealthLabel[health]}**.`,
    "",
    `Overnight: ${m.workCompletedSinceLastBrief} pieces of work completed, ${m.assignmentsInProgress} still in progress.`,
  ]
  if (decisions.length > 0) {
    lines.push("")
    lines.push(`You have **${decisions.length} decision${decisions.length > 1 ? "s" : ""}** to make. The most urgent is "${decisions[0].title}".`)
  }
  if (blocked.length > 0)
    lines.push(`\n${blocked.length} assignment${blocked.length > 1 ? "s are" : " is"} blocked and may need you.`)
  lines.push("\nOpen **Home** for the full brief, or ask me for what needs your attention.")
  return lines.join("\n")
}

function helpReply(): string {
  return [
    "I'm your Executive Assistant. Try:",
    '- "Give me an update."',
    '- "What needs my attention?"',
    '- "What is the Product Manager working on?"',
    '- "Show me blocked work."',
    '- "Prepare my morning brief."',
    '- "Create an assignment for the Knowledge Architect."',
  ].join("\n")
}

export function composeReply(message: string, state: ConsoleState): ConversationReply {
  const match = matchIntent(message, state)
  switch (match.intent) {
    case "update":
      return { text: updateReply(state), intent: match.intent }
    case "attention":
      return { text: attentionReply(state), intent: match.intent }
    case "blocked":
      return { text: blockedReply(state), intent: match.intent }
    case "officer-work":
      return { text: officerReply(state, match), intent: match.intent }
    case "create-assignment":
      return { text: createAssignmentReply(state, match), intent: match.intent }
    case "morning-brief":
      return { text: morningBriefReply(state), intent: match.intent }
    case "help":
      return { text: helpReply(), intent: match.intent }
    default:
      return {
        text: `I didn't quite catch that. ${helpReply()}`,
        intent: "unknown",
      }
  }
}

export class DeterministicEaProvider implements ConversationProvider {
  readonly name = "deterministic-ea"
  async reply(input: {
    message: string
    state: ConsoleState
  }): Promise<ConversationReply> {
    return composeReply(input.message, input.state)
  }
}
