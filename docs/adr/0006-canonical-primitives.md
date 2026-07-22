# ADR 0006 — Canonical organizational primitives (v0.1)

- Status: **Accepted — ratified by the Product Director, 22 July 2026**
- Date: 2026-07-22 (Architecture Sprint 1)

## Context

Architecture Sprint 1 charged the Founding Council with identifying the
permanent operating primitives of Founder Console. The working paper
(`docs/architecture/organizational-primitives-v0.1.md`) subjected every
concept in the product to recorded elimination attempts. The Product Director
reviewed the paper and ratified the surviving set.

## Decision

Founder Console's canonical primitives are:

| Primitive | Definition |
| --- | --- |
| **Actor** | Something that can hold intent, commit, and act — recursively composable (an organization is an Actor of Actors) |
| **Outcome** | A state of the world the organization intends |
| **Commitment** | An Actor's accountable promise to bring about an Outcome |
| **Decision** | An exercise of authority selecting among alternatives, binding the organization |
| **Event** | An immutable fact: who did what, when |

Fundamental relationships: **accountability** (Actor owes Commitment to
Actor), **authority** (Actor may decide within a scope), **service**
(Commitment serves Outcome; Outcomes decompose), **dependency** (Commitment
depends on Commitment), **provenance** (everything traces to Events).

Everything else — Organization, Person, Role, OfficerAssignment, Knowledge,
Deliverable, Task, the Executive Brief, health, scores, risks — is a
relationship between primitives or a projection over them (see the derivation
map in the working paper).

## Consequences

1. **Evaluation lens.** Every future feature, entity, or integration must
   state which primitive it serves or which projection it is. Anything that
   cannot answer is challenged before it is built.
2. **No code changes now.** The engineering model (ADR 0004 boundary) already
   maps cleanly onto the primitives; migration pressure is zero.
3. **Flagged for re-examination** (recorded, not blocking):
   - *Decision* is the weakest primitive — when authority is modelled
     explicitly, it may reduce to a commitment-by-authority.
   - *Claim* (external knowledge) may join as a sixth primitive if the
     Organizational Mind sprint proves internal Events insufficient. The
     Chief Skeptic holds a standing objection until a concrete failure
     demands it.
4. **Twin alignment.** The Organizational Twin specification must express its
   canonical objects in terms of these primitives or justify divergence.
5. Amendments to this set are constitutional decisions — they require the
   Product Director and a recorded elimination argument.
