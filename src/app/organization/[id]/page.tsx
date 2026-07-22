import { notFound } from "next/navigation"

import { ActivityList } from "@/components/console/activity-list"
import { AssignmentRow } from "@/components/console/assignment-row"
import { AssignWorkPanel } from "@/components/console/assign-work-panel"
import { CommitmentRow } from "@/components/console/commitment-row"
import { DelegateButton } from "@/components/console/delegate-dialog"
import { DeliverableRow } from "@/components/console/deliverable-row"
import {
  EmptyState,
  InfoRow,
  MetricTile,
  PageHeader,
  Section,
} from "@/components/console/primitives"
import {
  ConfidenceLevelLabel,
  DecisionStatus,
  RoleStatusLabel,
} from "@/lib/console/domain/enums"
import { OVERLOAD_THRESHOLD, isOverdue } from "@/lib/console/domain/logic"
import { getOfficerDetail } from "@/lib/console/services/console-service"

export const dynamic = "force-dynamic"

export default async function OfficerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const detail = await getOfficerDetail(id)
  if (!detail) notFound()

  const {
    summary,
    commitments,
    workload,
    averageConfidence,
    deliveryScore,
    deliverables,
    decisions,
    activity,
  } = detail
  const { person, role, reportsToRole } = summary
  const openDecisions = decisions.filter((d) => d.status === DecisionStatus.Waiting)
  const blocked = summary.currentAssignments.filter((a) => a.status === "blocked")
  const now = new Date().toISOString()

  const objectives = [
    ...commitments.active.map((c) => c.outcome),
    ...summary.currentAssignments.map((a) => a.objective),
  ].filter((o, i, all) => all.indexOf(o) === i)

  return (
    <>
      <PageHeader
        eyebrow={RoleStatusLabel[role.status]}
        title={person.name}
        description={role.mission}
        actions={<DelegateButton defaultOfficerId={id} />}
      />

      <Section title="At a glance" description="Observable data only — no AI scoring.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricTile
            label={`Current workload${workload >= OVERLOAD_THRESHOLD ? " — heavy" : ""}`}
            value={workload}
            tone={workload >= OVERLOAD_THRESHOLD ? "warn" : "default"}
          />
          <MetricTile
            label="Average confidence"
            value={
              averageConfidence
                ? `${ConfidenceLevelLabel[averageConfidence.level]}`
                : "—"
            }
          />
          <MetricTile
            label={
              deliveryScore
                ? `Delivery score (${deliveryScore.onTime}/${deliveryScore.concluded} on time)`
                : "Delivery score"
            }
            value={deliveryScore ? `${deliveryScore.score}%` : "—"}
            tone={
              deliveryScore
                ? deliveryScore.score >= 80
                  ? "good"
                  : deliveryScore.score >= 50
                    ? "warn"
                    : "danger"
                : "default"
            }
          />
          <MetricTile
            label="Blocked commitments"
            value={commitments.blocked.length}
            tone={commitments.blocked.length > 0 ? "danger" : "default"}
          />
        </div>
        {!deliveryScore ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Delivery score appears after the first concluded commitment.
          </p>
        ) : null}
      </Section>

      <Section title="Objectives" description="The outcomes this officer is driving.">
        {objectives.length === 0 ? (
          <EmptyState title="No active objectives" />
        ) : (
          <ul className="space-y-2">
            {objectives.map((o) => (
              <li key={o} className="flex items-start gap-2 text-sm leading-6">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground/60" />
                {o}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title={`Active commitments (${commitments.active.length})`}>
        {commitments.active.length === 0 ? (
          <EmptyState title="No active commitments" />
        ) : (
          <div className="space-y-3">
            {commitments.active.map((c) => (
              <CommitmentRow
                key={c.id}
                commitment={c}
                ownerName={person.name}
                overdue={isOverdue(c, now)}
              />
            ))}
          </div>
        )}
      </Section>

      {commitments.overdue.length > 0 ? (
        <Section title={`Overdue (${commitments.overdue.length})`}>
          <div className="space-y-3">
            {commitments.overdue.map((c) => (
              <CommitmentRow key={c.id} commitment={c} ownerName={person.name} overdue />
            ))}
          </div>
        </Section>
      ) : null}

      <Section title={`Completed commitments (${commitments.completed.length})`}>
        {commitments.completed.length === 0 ? (
          <EmptyState title="Nothing concluded yet" />
        ) : (
          <div className="space-y-3">
            {commitments.completed.map((c) => (
              <CommitmentRow key={c.id} commitment={c} ownerName={person.name} />
            ))}
          </div>
        )}
      </Section>

      <Section title="Charter">
        <div className="rounded-xl border border-border/60 bg-card px-4 py-2 sm:px-5">
          <dl className="divide-y divide-border/50">
            <InfoRow label="Role">{role.title}</InfoRow>
            <InfoRow label="Reports to">{reportsToRole?.title ?? "—"}</InfoRow>
            <InfoRow label="Authority">{role.authority}</InfoRow>
            <InfoRow label="Responsibilities">
              <ul className="list-disc space-y-1 pl-4">
                {role.responsibilities.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </InfoRow>
            <InfoRow label="Boundaries">
              <ul className="list-disc space-y-1 pl-4">
                {role.boundaries.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </InfoRow>
          </dl>
        </div>
      </Section>

      <Section title="Current assignments">
        {summary.currentAssignments.length === 0 ? (
          <EmptyState title="No active assignments" />
        ) : (
          <div className="space-y-3">
            {summary.currentAssignments.map((a) => (
              <AssignmentRow key={a.id} assignment={a} ownerName={person.name} />
            ))}
          </div>
        )}
      </Section>

      <Section title="Assign work">
        <AssignWorkPanel ownerOfficerAssignmentId={id} officerName={person.name} />
      </Section>

      <Section title="Deliverables">
        {deliverables.length === 0 ? (
          <EmptyState title="No deliverables yet" />
        ) : (
          <div className="space-y-3">
            {deliverables.map((d) => (
              <DeliverableRow
                key={d.id}
                deliverable={d}
                authorName={person.name}
                href={`/work/${d.assignmentId}`}
              />
            ))}
          </div>
        )}
      </Section>

      <Section title="Questions & blockers">
        {openDecisions.length === 0 && blocked.length === 0 && commitments.blocked.length === 0 ? (
          <EmptyState title="Nothing outstanding" description="No open questions or blockers." />
        ) : (
          <div className="space-y-2">
            {commitments.blocked.map((c) => (
              <div key={c.id} className="rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3">
                <p className="text-sm font-medium">{c.title}</p>
                <p className="text-sm text-muted-foreground">{c.blockedReason}</p>
              </div>
            ))}
            {blocked.map((a) => (
              <div key={a.id} className="rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3">
                <p className="text-sm font-medium">{a.title}</p>
                <p className="text-sm text-muted-foreground">{a.blockedReason}</p>
              </div>
            ))}
            {openDecisions.map((d) => (
              <div key={d.id} className="rounded-lg border border-border/60 bg-card px-4 py-3">
                <p className="text-sm font-medium">{d.title}</p>
                <p className="text-sm text-muted-foreground">{d.whyItMatters}</p>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Activity history">
        <ActivityList events={activity} />
      </Section>

      <Section title="Context & sources">
        <div className="rounded-xl border border-dashed border-border/70 bg-card/30 px-5 py-6 text-sm text-muted-foreground">
          Links to supporting sessions and source material will surface here when a
          real agent backend is connected. You should not need them for day-to-day
          coordination.
        </div>
      </Section>
    </>
  )
}
