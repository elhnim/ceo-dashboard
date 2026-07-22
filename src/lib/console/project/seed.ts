/**
 * Project State Engine — seed: Founder Console's real development program.
 *
 * These are FACTS about the project (curated by the Executive Office and
 * refreshed each engineering cycle via ordinary commits). Everything the
 * Executive Office DISPLAYS — status, health, progress, the recommended next
 * action — is derived from these facts in logic.ts, never hand-written into
 * the UI.
 */

import type { ProjectState } from "@/types/project"

export function createProjectSeed(): ProjectState {
  return {
    programName: "Founder Console",

    layers: [
      {
        id: "layer-1",
        name: "Layer 1 — Executive Awareness",
        status: "completed",
        summary: "See the organization: brief, officers, work, decisions, record.",
      },
      {
        id: "layer-2",
        name: "Layer 2 — Executive Coordination",
        status: "completed",
        summary: "Direct the organization: commitments, delegation, decision workflow, verification.",
      },
      {
        id: "layer-3",
        name: "Layer 3 — Architecture & Self-Coordination",
        status: "current",
        summary: "Founder Console becomes the first organization it manages; primitives govern all future design.",
      },
    ],

    milestones: [
      {
        id: "ms-m1",
        code: "M1",
        title: "Founder Console MVP",
        status: "completed",
        objective: "A calm executive cockpit over a strongly-typed domain.",
        items: [],
        priority: 0,
      },
      {
        id: "ms-m1-1",
        code: "M1.1",
        title: "Executive Office revisions",
        status: "completed",
        objective: "One screen answers: what should I focus on in the next 30 minutes?",
        items: [],
        priority: 0,
      },
      {
        id: "ms-m2",
        code: "M2",
        title: "Executive Coordination Engine",
        status: "completed",
        objective: "Commitments, decision workflow, delegation, verification — accountability as structure.",
        items: [],
        priority: 0,
      },
      {
        id: "ms-eo005",
        code: "EO-005",
        title: "Executive Office v0.1",
        status: "completed",
        objective:
          "Founder Console coordinates its own development: project state engine, Executive Office home, Begin Session.",
        items: [],
        priority: 0,
      },
      {
        id: "ms-sprint2",
        code: "AS-2",
        title: "Architecture Sprint 2 — Commitment semantics & authority",
        status: "current",
        objective:
          "Deep definitions on the ratified primitives: the Commitment conversation lifecycle and an explicit authority model.",
        items: [
          { id: "it-session-commitment", title: "Hold the session: What is a Commitment?", owner: "Product Director + Founding Council", status: "planned", eta: "~30 min" },
          { id: "it-commitment-spec", title: "Commitment semantics specification", owner: "Founding Council", status: "planned", eta: "1 session" },
          { id: "it-authority-paper", title: "Authority model working paper", owner: "Chief Organizational Architect", status: "planned", eta: "1 session" },
        ],
        priority: 1,
      },
      {
        id: "ms-twin",
        code: "L3-M1",
        title: "Organizational Twin specification aligned to primitives",
        status: "planned",
        objective: "Express the Twin's canonical objects in terms of the five ratified primitives.",
        items: [],
        priority: 3,
      },
      {
        id: "ms-persistence",
        code: "L3-M2",
        title: "Durable persistence",
        status: "planned",
        objective: "A real database behind ConsoleRepository; removes the largest carried risk.",
        items: [],
        priority: 4,
      },
      {
        id: "ms-agent",
        code: "L3-M3",
        title: "First live officer",
        status: "planned",
        objective: "One real AgentProvider executes a commitment end to end.",
        items: [],
        priority: 5,
      },
      {
        id: "ms-mind",
        code: "L3-M4",
        title: "Organizational Mind sprint",
        status: "planned",
        objective: "Knowledge as projection vs. Claim primitive — settle it with a working design.",
        items: [],
        priority: 6,
      },
    ],

    sprints: [
      {
        id: "sprint-1",
        title: "Architecture Sprint 1 — Organizational Primitives",
        status: "complete",
        objective: "Identify the irreducible operating primitives.",
        topics: [
          {
            id: "topic-primitives",
            title: "Which concepts are primitive?",
            status: "done",
            questions: [],
            materialIds: [],
            expectedDeliverables: ["Primitives working paper", "ADR 0006"],
          },
        ],
      },
      {
        id: "sprint-2",
        title: "Architecture Sprint 2 — Commitment semantics & authority",
        status: "active",
        objective:
          "Give the two most load-bearing primitives their full semantics before any further engineering.",
        topics: [
          {
            id: "topic-commitment",
            title: "What is a Commitment? — the full conversation lifecycle",
            status: "session-ready",
            questions: [
              "Does our lifecycle (Draft → Committed → In progress → Blocked ⇄ → Completed → Verified) match the request → negotiate → commit → deliver → verify conversation-for-action loop?",
              "Where does negotiation live — can an officer counter-propose a due date or success criteria before committing?",
              "Is rejection of a delegation representable, or does Draft silently absorb it?",
              "Should Verified require the requester specifically, or any actor with authority?",
            ],
            materialIds: ["res-cba", "res-promise", "res-decision-rights", "res-systems"],
            expectedDeliverables: [
              "Commitment semantics specification (docs/architecture)",
              "Lifecycle gap list — proposed, not implemented (engineering stays paused)",
            ],
            decision: {
              background:
                "The ratified Commitment primitive has a working lifecycle from Milestone 2, built pragmatically before the primitives existed. Sprint 2 tests it against commitment-based management theory.",
              options: [
                "Ratify the current lifecycle as sufficient for v1",
                "Extend it with an explicit negotiation phase (offer / counter / accept)",
                "Extend it with rejection + renegotiation on blocked",
              ],
              tradeoffs:
                "The current lifecycle is simple and shipped; negotiation adds honesty about how delegation really works but grows every surface that touches commitments.",
              recommendation:
                "Hold the session, then extend the specification with negotiation semantics while keeping the engineering lifecycle unchanged until the Twin spec lands.",
              risks:
                "Specifying semantics we never build is waste; building them now violates the engineering pause.",
            },
          },
          {
            id: "topic-authority",
            title: "Authority — should Decision reduce to a commitment made by an authority?",
            status: "ready",
            questions: [
              "What is the minimal authority model: grants, scopes, delegation chains?",
              "If authority is explicit, does the Decision primitive survive?",
              "How do constitutional decisions differ from operational ones?",
            ],
            materialIds: ["res-decision-rights"],
            expectedDeliverables: ["Authority model working paper"],
          },
          {
            id: "topic-claim",
            title: "Claim — does external knowledge force a sixth primitive?",
            status: "deferred",
            questions: [
              "Can imported research and world-models reduce to internal Events?",
            ],
            materialIds: [],
            expectedDeliverables: ["Deferred to the Organizational Mind sprint"],
          },
        ],
      },
    ],

    approvals: [
      {
        id: "ap-merge-eo005",
        kind: "merge",
        title: "Merge approval: Executive Office v0.1 + ADR 0006 (PR #14)",
        detail:
          "Ships the Project State Engine, the Executive Office home, Begin Session, the ratified primitives paper, and ADR 0006.",
        href: "https://github.com/elhnim/ceo-dashboard/pull/14",
        estimatedMinutes: 10,
        priority: 1,
        status: "approved",
        resolvedAt: "2026-07-22T17:10:00.000Z",
        rationale: "Approved by the Product Director; squash-merged to main.",
        why:
          "Until this merges, Founder Console cannot coordinate its own development from main — the Director remains the operating system.",
        expectedOutcome: "EO-005 live on main; the Executive Office becomes the home screen.",
        expectedImpact: "Every future planning cycle starts inside Founder Console instead of ChatGPT.",
      },
      {
        id: "ap-research-review",
        kind: "research",
        title: "Research review: four prepared briefs",
        detail:
          "Commitment-based management, Promise Theory, decision rights, systems thinking — prepared for Architecture Sprint 2.",
        href: "/session",
        estimatedMinutes: 15,
        priority: 2,
        status: "open",
        resolvedAt: null,
        rationale: null,
        why: "Sprint 2's first session builds directly on these briefs.",
        expectedOutcome: "Research marked reviewed; session held with shared context.",
        expectedImpact: "Commitment semantics grounded in forty years of theory, not improvisation.",
      },
    ],

    research: [
      {
        id: "res-cba",
        title: "Commitment-Based Management",
        source: "Winograd & Flores — conversations for action",
        summary:
          "Work in organizations advances through language acts: a request opens a conversation, negotiation converges on conditions of satisfaction, a promise binds the performer, delivery is declared, and the requester — not the performer — declares completion. The loop is closed only by the customer of the work.",
        relevance:
          "Directly validates the Commitment primitive and our requester-verifies lifecycle; exposes the missing negotiation phase Sprint 2 examines.",
        status: "prepared",
      },
      {
        id: "res-promise",
        title: "Promise Theory",
        source: "Mark Burgess",
        summary:
          "Autonomous agents can only make promises about their own behaviour — obligations imposed from outside are unreliable coordination. Systems built on voluntary, verifiable promises degrade more gracefully than command hierarchies.",
        relevance:
          "Supports commitments as self-made promises (officers commit; the Director requests and verifies) and warns against modelling delegation as command.",
        status: "prepared",
      },
      {
        id: "res-decision-rights",
        title: "Decision Rights & Agency",
        source: "Jensen & Meckling — specific knowledge and decision-rights allocation",
        summary:
          "Organizations perform when decision rights are collocated with the specific knowledge needed to exercise them, with control systems (verification) closing the loop. Authority is a designed allocation, not an org-chart accident.",
        relevance:
          "The foundation for Sprint 2's authority topic — whether Decision reduces to commitment-by-authority once grants are explicit.",
        status: "prepared",
      },
      {
        id: "res-systems",
        title: "Systems Thinking",
        source: "Donella Meadows — leverage points, stocks and flows",
        summary:
          "System behaviour follows structure: stocks (open commitments), flows (completion rates), and feedback loops (verification, risk signals) explain health better than point events. The highest leverage is changing the paradigm the system serves.",
        relevance:
          "Frames the health/momentum projections as feedback loops and justifies deriving state rather than storing it.",
        status: "prepared",
      },
    ],

    architectureBacklog: [
      {
        id: "ab-commitment",
        title: "What is a Commitment? — full conversation lifecycle",
        detail: "Negotiation, rejection, renegotiation; conditions of satisfaction.",
        priority: 1,
        status: "ready",
      },
      {
        id: "ab-authority",
        title: "Authority model",
        detail: "Explicit grants and scopes; does the Decision primitive survive?",
        priority: 2,
        status: "ready",
      },
      {
        id: "ab-relationships",
        title: "Relationship model",
        detail: "First-class edges vs. foreign-key fields for the five relationships.",
        priority: 3,
        status: "planned",
      },
      {
        id: "ab-outcome",
        title: "Outcome decomposition semantics",
        detail: "How outcomes nest; when is an outcome 'achieved'?",
        priority: 4,
        status: "planned",
      },
      {
        id: "ab-claim",
        title: "Claim — sixth primitive?",
        detail: "External knowledge vs. Events projection. Skeptic opposes until a failure demands it.",
        priority: 5,
        status: "paused",
      },
      {
        id: "ab-consolidation",
        title: "WorkAssignment ↔ Commitment consolidation",
        detail: "Fold execution detail into commitment decomposition when real agents arrive.",
        priority: 6,
        status: "paused",
      },
    ],

    engineeringBacklog: [
      {
        id: "eb-persistence",
        title: "Durable persistence behind ConsoleRepository",
        detail: "Largest carried risk; unblocks multi-request state.",
        priority: 1,
        status: "paused",
      },
      {
        id: "eb-ci",
        title: "CI pipeline (lint · test · build on push)",
        detail: "Catches config regressions before main.",
        priority: 2,
        status: "paused",
      },
      {
        id: "eb-agent",
        title: "First AgentProvider",
        detail: "One officer executes a commitment end to end.",
        priority: 3,
        status: "paused",
      },
      {
        id: "eb-ea",
        title: "Real EA reasoning into workspace panels",
        detail: "Replaces the labelled sample panels.",
        priority: 4,
        status: "paused",
      },
    ],

    log: [
      { at: "2026-07-01T09:00:00.000Z", kind: "decision", title: "Founding strategic decisions recorded", detail: "Eleven constitutional decisions, including the 10-Year Rule and one canonical source of truth." },
      { at: "2026-07-21T14:55:00.000Z", kind: "milestone", title: "M1 — Founder Console MVP approved & merged", detail: "Six screens, typed domain, 44 tests. Repository reset: Founder Console becomes the sole application." },
      { at: "2026-07-21T16:30:00.000Z", kind: "decision", title: "Netlify confirmed as deploy target", detail: "Vercel switch reverted; serverless-safe persistence fallback added." },
      { at: "2026-07-22T09:00:00.000Z", kind: "milestone", title: "M1.1 — Executive Office revisions approved & merged", detail: "Today's Priorities leads the Brief; Organization and Knowledge named; canonical-model boundary (ADR 0004)." },
      { at: "2026-07-22T13:30:00.000Z", kind: "milestone", title: "M2 — Executive Coordination Engine approved & merged", detail: "Commitments with verified lifecycle, decision workflow, delegation from anywhere. 76 tests." },
      { at: "2026-07-22T15:00:00.000Z", kind: "architecture", title: "Organizational Primitives v0.1 working paper delivered", detail: "Founding Council elimination pass; five primitives survive." },
      { at: "2026-07-22T16:00:00.000Z", kind: "decision", title: "Primitives v0.1 RATIFIED by the Product Director", detail: "Actor · Outcome · Commitment · Decision · Event canonized as ADR 0006. Architecture Sprint 1 complete." },
      { at: "2026-07-22T16:05:00.000Z", kind: "order", title: "EO-005 issued — Executive Office becomes the home screen", detail: "Founder Console must become the first organization it manages. Project State Engine ordered as the single source of truth." },
      { at: "2026-07-22T17:10:00.000Z", kind: "milestone", title: "EO-005 approved & merged — the Executive Office is live", detail: "Project State Engine, Office home, Begin Session, ADR 0006. Founder Console now coordinates its own development; Architecture Sprint 2 is the current milestone." },
    ],

    engineering: {
      branch: "claude/founder-console-mvp-2kmxs3",
      buildStatus: "passing",
      tests: { total: 88, passing: 88 },
      latestMilestone: "EO-005 — Executive Office v0.1",
      latestAdr: "ADR 0006 — Canonical organizational primitives",
      openPullRequest: "#15 — program curation after the EO-005 merge",
    },

    sessions: [],
  }
}
