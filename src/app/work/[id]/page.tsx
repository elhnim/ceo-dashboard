import { notFound } from "next/navigation"

import { ActivityList } from "@/components/console/activity-list"
import {
  PriorityBadge,
  ReviewBadge,
  StatusBadge,
} from "@/components/console/badges"
import { DeliverableReview } from "@/components/console/deliverable-review"
import { EmptyState, InfoRow, PageHeader, Section } from "@/components/console/primitives"
import { WorkStatusControl } from "@/components/console/work-status-control"
import {
  DeliverableTypeLabel,
  ReviewStatus,
} from "@/lib/console/domain/enums"
import { formatDate, formatDateTime } from "@/lib/console/format"
import { getState } from "@/lib/console/services/console-service"

export const dynamic = "force-dynamic"

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const state = await getState()
  const assignment = state.workAssignments.find((a) => a.id === id)
  if (!assignment) notFound()

  const name = (oaId: string) => {
    const oa = state.officerAssignments.find((o) => o.id === oaId)
    const person = oa ? state.people.find((p) => p.id === oa.personId) : undefined
    return person?.name ?? "an officer"
  }

  const deliverables = state.deliverables.filter((d) => d.assignmentId === id)
  const linkedDecisions = state.decisions.filter((d) =>
    d.affectedAssignmentIds.includes(id),
  )
  const dependencies = assignment.dependencyIds
    .map((depId) => state.workAssignments.find((a) => a.id === depId))
    .filter(Boolean)
  const activity = state.activity
    .filter((e) => e.relatedEntityId === id)
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))

  return (
    <>
      <PageHeader
        eyebrow="Assignment"
        title={assignment.title}
        description={assignment.objective}
        actions={
          <div className="flex items-center gap-2">
            <PriorityBadge priority={assignment.priority} />
            <StatusBadge status={assignment.status} />
          </div>
        }
      />

      {assignment.status === "blocked" && assignment.blockedReason ? (
        <div className="mb-8 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm">
          <span className="font-medium">Blocked — </span>
          {assignment.blockedReason}
        </div>
      ) : null}

      <Section title="Details">
        <div className="rounded-xl border border-border/60 bg-card px-4 py-2 sm:px-5">
          <dl className="divide-y divide-border/50">
            {assignment.description ? (
              <InfoRow label="Description">{assignment.description}</InfoRow>
            ) : null}
            <InfoRow label="Owner">{name(assignment.ownerOfficerAssignmentId)}</InfoRow>
            {assignment.collaboratorIds.length > 0 ? (
              <InfoRow label="Collaborators">
                {assignment.collaboratorIds.map(name).join(", ")}
              </InfoRow>
            ) : null}
            {assignment.dueDate ? (
              <InfoRow label="Due">{formatDate(assignment.dueDate)}</InfoRow>
            ) : null}
            {dependencies.length > 0 ? (
              <InfoRow label="Dependencies">
                {dependencies.map((d) => d!.title).join(", ")}
              </InfoRow>
            ) : null}
            {linkedDecisions.length > 0 ? (
              <InfoRow label="Linked decisions">
                <ul className="list-disc space-y-1 pl-4">
                  {linkedDecisions.map((d) => (
                    <li key={d.id}>{d.title}</li>
                  ))}
                </ul>
              </InfoRow>
            ) : null}
            <InfoRow label="Status">
              <WorkStatusControl assignmentId={assignment.id} current={assignment.status} />
            </InfoRow>
          </dl>
        </div>
      </Section>

      <Section title="Acceptance criteria">
        {assignment.acceptanceCriteria.length === 0 ? (
          <EmptyState title="No acceptance criteria defined" />
        ) : (
          <ul className="space-y-2">
            {assignment.acceptanceCriteria.map((c) => (
              <li key={c} className="flex items-start gap-2 text-sm">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground/60" />
                {c}
              </li>
            ))}
          </ul>
        )}
      </Section>

      {assignment.progress.length > 0 ? (
        <Section title="Progress">
          <ol className="space-y-3">
            {assignment.progress
              .slice()
              .reverse()
              .map((p, i) => (
                <li key={`${p.at}-${i}`} className="rounded-lg border border-border/50 bg-card/40 px-4 py-3">
                  <p className="text-sm">{p.note}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(p.at)}</p>
                </li>
              ))}
          </ol>
        </Section>
      ) : null}

      <Section title="Deliverables">
        {deliverables.length === 0 ? (
          <EmptyState title="No deliverables submitted yet" />
        ) : (
          <div className="space-y-4">
            {deliverables.map((d) => (
              <article key={d.id} className="rounded-xl border border-border/60 bg-card p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold">{d.title}</h3>
                    <span className="text-xs text-muted-foreground">v{d.version}</span>
                  </div>
                  <ReviewBadge status={d.reviewStatus} />
                </div>
                <p className="mt-1 text-xs uppercase tracking-[0.08em] text-muted-foreground">
                  {DeliverableTypeLabel[d.type]} · by {name(d.authorOfficerAssignmentId)}
                </p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{d.summary}</p>

                <details className="mt-3 group">
                  <summary className="cursor-pointer text-sm font-medium text-foreground/80 hover:text-foreground">
                    View full content
                  </summary>
                  <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-lg border border-border/50 bg-muted/40 p-4 text-sm leading-6 font-sans">
                    {d.content}
                  </pre>
                </details>

                {d.reviewComments.length > 0 ? (
                  <div className="mt-4 space-y-2 border-t border-border/50 pt-3">
                    {d.reviewComments.map((c, i) => (
                      <p key={i} className="text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{c.author}:</span> {c.comment}
                      </p>
                    ))}
                  </div>
                ) : null}

                {d.reviewStatus === ReviewStatus.Submitted ? (
                  <div className="mt-4 border-t border-border/50 pt-4">
                    <DeliverableReview deliverableId={d.id} />
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </Section>

      <Section title="Activity">
        <ActivityList events={activity} />
      </Section>
    </>
  )
}
