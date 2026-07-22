# ADR 0004 — Engineering model vs. Organizational Twin ontology

- Status: Accepted
- Date: 2026-07-21 (Milestone 1.1)

## Context

Founder Console's domain entities — Organization, Person, Role,
OfficerAssignment, WorkAssignment, Deliverable, Decision, ActivityEvent,
ExecutiveBrief, ConversationTurn — were shaped to ship a working executive
product quickly. Meanwhile, the Chief Product Modeller is designing the
Organizational Twin: the platform's canonical objects, relationships, identity,
versioning, and change propagation.

These two models will resemble each other. That resemblance is a trap: it
invites treating today's engineering types as the platform's ontology, freezing
MVP pragmatism into canon.

## Decision

**This model represents the current engineering implementation and must not be
treated as the final Organizational Twin ontology.**

Concretely:

- The types in `src/types/console/` are an implementation detail of this
  application. They may be renamed, split, merged, or discarded when the Twin
  specification lands.
- The Organizational Twin ontology is defined by its own specification process
  (see the "Organizational Twin Specification" deliverable in-app), owned by
  the Chief Product Modeller and approved by the Product Director — not by
  this codebase.
- New platform work must not import these types as if they were canonical
  platform objects. When the Twin exists, an explicit mapping/adapter layer
  will translate between the Twin ontology and whatever this application needs.
- The optional `meta?: KnowledgeMetadata` field added in M1.1 (provenance,
  confidence, evidence, relatedEntities, history) is *architectural
  preparation only* — carrying room for future knowledge annotations, not a
  commitment to a knowledge model. Nothing reads or writes it.

## Consequences

- Engineers extend `src/types/console/` freely for product needs without
  worrying about ontological purity.
- Twin design work proceeds unconstrained by MVP shortcuts.
- A future ADR will define the mapping layer once Twin Specification v1 is
  approved.
