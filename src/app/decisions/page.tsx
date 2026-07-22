import { DecisionActions } from "@/components/console/decision-actions"
import { DecisionCard } from "@/components/console/decision-card"
import { DecisionStageActions } from "@/components/console/decision-stage-actions"
import { StageBadge } from "@/components/console/badges"
import { EmptyState, PageHeader, Section } from "@/components/console/primitives"
import {
  DecisionStage,
  DecisionStatus,
  DecisionStatusLabel,
} from "@/lib/console/domain/enums"
import { endOfDueDay, sortByPriority } from "@/lib/console/domain/logic"
import { getState } from "@/lib/console/services/console-service"
import { formatRelative } from "@/lib/console/format"

export const dynamic = "force-dynamic"

export default async function DecisionsPage() {
  const state = await getState()
  const now = new Date().toISOString()
  const name = (id: string) => {
    const oa = state.officerAssignments.find((o) => o.id === id)
    const person = oa ? state.people.find((p) => p.id === oa.personId) : undefined
    return person?.name ?? "an officer"
  }
  const commitmentTitles = (ids: string[]) =>
    ids
      .map((id) => state.commitments.find((c) => c.id === id)?.title)
      .filter((t): t is string => t !== undefined)

  const waiting = sortByPriority(
    state.decisions.filter((d) => d.status === DecisionStatus.Waiting),
    (d) => d.priority,
  )
  // Approved decisions still moving through execution and verification.
  const inExecution = state.decisions.filter(
    (d) =>
      d.stage === DecisionStage.Approved || d.stage === DecisionStage.Executed,
  )
  const resolved = state.decisions
    .filter(
      (d) =>
        d.status !== DecisionStatus.Waiting &&
        !inExecution.some((x) => x.id === d.id),
    )
    .sort((a, b) => (b.decidedAt ?? "").localeCompare(a.decidedAt ?? ""))

  return (
    <>
      <PageHeader
        eyebrow="Decision queue"
        title="Decisions"
        description="Everything awaiting your judgment, most urgent first — then approved decisions moving through execution to verification."
      />

      <Section title={`Waiting on you (${waiting.length})`}>
        {waiting.length === 0 ? (
          <EmptyState
            title="You're all caught up"
            description="No decisions are waiting. The Executive Assistant will surface new ones here."
          />
        ) : (
          <div className="space-y-4">
            {waiting.map((decision) => (
              <DecisionCard
                key={decision.id}
                decision={decision}
                requestedBy={name(decision.requestingOfficerAssignmentId)}
                ownerName={name(decision.decisionOwnerId)}
                linkedCommitmentTitles={commitmentTitles(decision.linkedCommitmentIds)}
                overdue={decision.dueDate !== null && endOfDueDay(decision.dueDate) < now}
                expanded
                actions={<DecisionActions decisionId={decision.id} />}
              />
            ))}
          </div>
        )}
      </Section>

      {inExecution.length > 0 ? (
        <Section
          title={`In execution (${inExecution.length})`}
          description="Approved — track them to executed, then verify the outcome."
        >
          <div className="space-y-2">
            {inExecution.map((d) => (
              <div
                key={d.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/50 bg-card/40 px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-medium">{d.title}</p>
                    <StageBadge stage={d.stage} />
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {d.rationale ?? d.executiveSummary}
                  </p>
                </div>
                <DecisionStageActions decisionId={d.id} stage={d.stage} />
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {resolved.length > 0 ? (
        <Section title="Recently resolved">
          <div className="space-y-2">
            {resolved.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-card/40 px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-medium">{d.title}</p>
                    <StageBadge stage={d.stage} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {DecisionStatusLabel[d.status]}
                    {d.decidedAt ? ` · ${formatRelative(d.decidedAt)}` : ""}
                    {d.rationale ? ` · ${d.rationale}` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      ) : null}
    </>
  )
}
