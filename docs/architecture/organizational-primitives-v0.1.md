# Organizational Primitives v0.1 — Working Paper

_Architecture Sprint 1 · Founding Council · 22 July 2026_
_Status: **Ratified by the Product Director, 22 July 2026 — canonized as ADR 0006.**_

## Purpose

Identify the permanent operating primitives of Founder Console — the
irreducible concepts every future layer (Organizational Twin, Organizational
Mind, real agents) will stand on. Method: enumerate every concept the product
currently uses, attempt to eliminate each one, and keep only what survives.
Per the working principles: fewer primitives, explicit relationships,
executive clarity, long-term architecture.

A concept earns "primitive" status only if repeated elimination attempts fail.
This paper records the attempts, not just the conclusions, so the reasoning
can be re-audited when reality pushes back.

---

## 1 · The candidates

Everything the engineering model uses today, plus the concepts the vision
implies: Organization, Person, Role, OfficerAssignment, WorkAssignment,
Commitment, Deliverable, Decision, ActivityEvent, ExecutiveBrief,
Conversation, Knowledge, Outcome, Priority, Health, Risk.

## 2 · Elimination attempts

### Organization — *eliminated as a distinct primitive; absorbed into Actor*

Attempt: define Organization without reference to anything else. It fails —
an organization is nothing but actors bound by agreements in service of
intent. The productive move is recursion: **an organization is an Actor
composed of Actors.** A team, a council, a company, and a single AI officer
are the same kind of thing at different scales: something that can hold
intent, make commitments, and act. This collapses Organization, team, and
"the Council" into one primitive and gives the platform multi-organization
scaling for free.

### Person / Officer / Role / OfficerAssignment — *reduced to Actor + two relationships*

- *Person vs. AI officer*: an implementation detail of the Actor (its
  substrate), not a different kind of thing. Eliminated as separate concepts.
- *Role*: attempt to keep it primitive fails under pressure. A Role is a
  **standing bundle**: a durable set of expected commitments plus a grant of
  authority. Both components decompose into primitives we already need
  (Commitment, and the authority relationship). Role survives as a *derived,
  named convenience* — important to the UI, not to the ontology.
- *OfficerAssignment*: a time-bounded relationship between an Actor and a
  Role-bundle. Derived.

### Commitment — *survives; the strongest primitive*

Attempt 1: reduce to Task. Fails — a task describes activity; a commitment
binds an Actor to an Outcome with success criteria and a due date. The binding
(accountability) is the irreducible part; activity is incidental.
Attempt 2: reduce to a pair of Events ("promised", "delivered"). Fails — the
open obligation *between* those events is precisely the thing executives
manage. State that something *is owed* cannot be reconstructed from events
without re-introducing the concept.
**Commitment is primitive: an Actor's accountable promise to bring about an
Outcome.**

### Decision — *survives, narrowly; the weakest primitive*

Attempt 1: reduce to a Commitment ("I commit to direction X"). Fails on one
property: a decision **binds actors other than the decider**. That binding
power is authority being exercised, and a promise cannot express it.
Attempt 2: reduce to an Event ("choice recorded"). Fails the same way an
eliminated commitment does — a pending decision is an open obligation *on the
authority-holder*, with alternatives and a deadline; it exists before any
event resolves it.
**Decision survives as: an exercise of authority selecting among alternatives,
binding the organization.** The Council flags it as the weakest survivor — if
a future sprint models authority explicitly and richly, Decision may reduce to
"a Commitment made *by* an authority *about* the organization's intent." Keep
it primitive for now; revisit when authority is formalized (see §5).

### Outcome — *survives*

Attempt: reduce to a field on Commitment. Fails — multiple commitments can
serve one outcome; outcomes exist before anyone commits to them and persist
when a commitment fails. Intent is not the same thing as obligation.
**Outcome is primitive: a state of the world the organization intends.**

### Event — *survives*

Attempt: derive the record from current state. Fails — state can always be
projected from the record, never the reverse. The immutable, timestamped
record of what happened is the organization's ground truth and the substrate
of everything derived (health, momentum, scores, Knowledge).
**Event is primitive: an immutable fact — who did what, when.**

### Knowledge — *eliminated as a primitive, with one reservation*

Attempt: Knowledge = projection over Events (facts interpreted, with
provenance and confidence). The attempt largely *succeeds* — which eliminates
Knowledge from the primitive set. Today's "organizational record" is exactly
this projection. Reservation (Chief Research Officer): knowledge that arrives
from *outside* the event stream (imported research, beliefs, models of the
world) may not reduce to internal events. Resolution: defer. If the
Organizational Mind sprint shows external beliefs need first-class standing,
this returns as a **Claim** primitive (a statement held with provenance and
confidence). Until proven necessary, Knowledge stays derived.

### The rest — *derived, without resistance*

- **Deliverable** → Evidence attached to a Commitment's fulfilment.
- **WorkAssignment / Task** → decomposition of a Commitment (execution detail).
- **ExecutiveBrief, Health, Risk, Priority, Momentum, Scores** → projections:
  pure functions over primitives. None are stored truths.
- **Conversation** → Events between Actors.

## 3 · The surviving primitives (v0.1 hypothesis)

Five primitives. Everything else in Founder Console is a relationship between
them or a projection over them.

| Primitive | One-line definition | Executive meaning |
| --- | --- | --- |
| **Actor** | Something that can hold intent, commit, and act — recursively composable | *Who* |
| **Outcome** | A state of the world the organization intends | *What for* |
| **Commitment** | An Actor's accountable promise to bring about an Outcome | *Who owes what* |
| **Decision** | An exercise of authority selecting among alternatives, binding the organization | *What was chosen* |
| **Event** | An immutable fact: who did what, when | *What happened* |

### Fundamental relationships

- **Accountability** — Actor *owes* Commitment (to another Actor).
- **Authority** — Actor *may decide* within a scope (granted by a Decision).
- **Service** — Commitment *serves* Outcome; Outcome *decomposes into* Outcomes.
- **Dependency** — Commitment *depends on* Commitment.
- **Provenance** — every Decision, Commitment, and projection *traces to* Events.

### Derivation map (current engineering model → primitives)

| Today's model | In primitive terms |
| --- | --- |
| Organization | Actor (composite) |
| Person, Role, OfficerAssignment | Actor + authority grant + standing commitments |
| WorkAssignment | Commitment decomposition |
| Deliverable | Evidence on a Commitment |
| ActivityEvent | Event |
| ExecutiveBrief, health, scores, risks | Projections |
| Knowledge / Organizational Mind | Projection over Events (or future Claim) |

## 4 · What this changes — and deliberately does not

**No code changes now.** Per ADR 0004, the engineering model is an
implementation, not the ontology; it already maps cleanly onto these
primitives (the table above), so nothing needs rewriting. The primitives
become the **evaluation lens**: every future feature, entity, or integration
must state which primitive it serves or which projection it is. Anything that
can't answer is challenged before it's built. The 10-Year Rule applies: these
five must make sense for a thousand-actor organization in 2036, not just five
officers in 2026.

## 5 · Open questions carried into review

1. **Authority** — currently implicit inside Decision. Should it be modelled
   explicitly (as a grant relationship), and does Decision then reduce to a
   commitment-by-authority? *(Chief Organizational Architect: yes eventually;
   Chief Skeptic: only when a real problem demands it.)*
2. **Claim** — does external knowledge force a sixth primitive, or does the
   Mind stay a projection? Defer to the Organizational Mind sprint.
3. **Verification** — today a lifecycle state; ontologically it is an Event
   ("the requester confirmed the outcome"). No action needed; recorded so the
   Twin models it correctly.

## 6 · Council positions

- **Chief Product Architect** — five primitives fit on one screen; the UI
  already speaks them (Delegate = create Commitment; Verify = close it).
- **Chief Organizational Architect** — recursion on Actor is the keystone; it
  is what makes the Engine universal rather than a five-officer tool.
- **Chief Systems Architect** — no migration pressure; the event log is
  already the substrate; projections stay pure functions. Cheap to honor.
- **Chief Research Officer** — matches the management-science spine
  (commitment-based management, Flores/Winograd speech-acts; decision rights,
  Jensen–Meckling): promises and decision rights, not tasks, are the atoms of
  organization.
- **Chief Skeptic** — accepted five, rejects six. Watching Decision (weakest
  survivor) and will oppose Claim until a concrete failure demands it.
