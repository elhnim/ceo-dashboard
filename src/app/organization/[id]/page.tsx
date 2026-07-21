import { notFound } from "next/navigation"

import { ActivityList } from "@/components/console/activity-list"
import { AssignmentRow } from "@/components/console/assignment-row"
import { AssignWorkPanel } from "@/components/console/assign-work-panel"
import { DeliverableRow } from "@/components/console/deliverable-row"
import { EmptyState, InfoRow, PageHeader, Section } from "@/components/console/primitives"
import {
  DecisionStatus,
  RoleStatusLabel,
} from "@/lib/console/domain/enums"
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

  const { summary, deliverables, decisions, activity } = detail
  const { person, role, reportsToRole } = summary
  const openDecisions = decisions.filter((d) => d.status === DecisionStatus.Waiting)
  const blocked = summary.currentAssignments.filter((a) => a.status === "blocked")

  return (
    <>
      <PageHeader
        eyebrow={RoleStatusLabel[role.status]}
        title={person.name}
        description={role.mission}
      />

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
        {openDecisions.length === 0 && blocked.length === 0 ? (
          <EmptyState title="Nothing outstanding" description="No open questions or blockers." />
        ) : (
          <div className="space-y-2">
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

      <Section title="Performance">
        <div className="rounded-xl border border-dashed border-border/70 bg-card/30 px-5 py-6 text-sm text-muted-foreground">
          Performance signals (throughput, review pass-rate, decision latency) will
          appear here once the organization has enough history. Placeholder for a
          future capability.
        </div>
      </Section>

      <Section title="Context & sources">
        <div className="rounded-xl border border-dashed border-border/70 bg-card/30 px-5 py-6 text-sm text-muted-foreground">
          Links to supporting sessions and source material will surface here when a
          real agent backend is connected. You should not need them for day-to-day
          supervision.
        </div>
      </Section>
    </>
  )
}
