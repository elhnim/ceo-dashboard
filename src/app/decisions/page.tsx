import { DecisionActions } from "@/components/console/decision-actions"
import { DecisionCard } from "@/components/console/decision-card"
import { EmptyState, PageHeader, Section } from "@/components/console/primitives"
import { DecisionStatusLabel } from "@/lib/console/domain/enums"
import { sortByPriority } from "@/lib/console/domain/logic"
import { DecisionStatus } from "@/lib/console/domain/enums"
import { getState } from "@/lib/console/services/console-service"
import { formatRelative } from "@/lib/console/format"

export const dynamic = "force-dynamic"

export default async function DecisionsPage() {
  const state = await getState()
  const name = (id: string) => {
    const oa = state.officerAssignments.find((o) => o.id === id)
    const person = oa ? state.people.find((p) => p.id === oa.personId) : undefined
    return person?.name ?? "an officer"
  }

  const waiting = sortByPriority(
    state.decisions.filter((d) => d.status === DecisionStatus.Waiting),
    (d) => d.priority,
  )
  const resolved = state.decisions
    .filter((d) => d.status !== DecisionStatus.Waiting)
    .sort((a, b) => (b.decidedAt ?? "").localeCompare(a.decidedAt ?? ""))

  return (
    <>
      <PageHeader
        eyebrow="Decision queue"
        title="Decisions"
        description="Everything awaiting your judgment, most urgent first. Each card carries the recommendation and the alternatives so you can decide in one place."
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
                expanded
                actions={<DecisionActions decisionId={decision.id} />}
              />
            ))}
          </div>
        )}
      </Section>

      {resolved.length > 0 ? (
        <Section title="Recently resolved">
          <div className="space-y-2">
            {resolved.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-card/40 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{d.title}</p>
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
