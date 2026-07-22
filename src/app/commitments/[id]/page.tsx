import Link from "next/link"
import { notFound } from "next/navigation"

import {
  CommitmentBadge,
  ConfidenceBadge,
  OverdueBadge,
} from "@/components/console/badges"
import {
  CommitmentActions,
  CommitmentNoteForm,
} from "@/components/console/commitment-actions"
import { CommitmentRow } from "@/components/console/commitment-row"
import { EmptyState, InfoRow, PageHeader, Section } from "@/components/console/primitives"
import { formatDate, formatDateTime } from "@/lib/console/format"
import { getCommitmentDetail, getState } from "@/lib/console/services/console-service"

export const dynamic = "force-dynamic"

export default async function CommitmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const detail = await getCommitmentDetail(id)
  if (!detail) notFound()
  const { commitment, ownerName, requestedByName, dependencies, dependents, linkedDecisions, overdue } = detail

  const state = await getState()
  const nameOf = (oaId: string) => {
    const oa = state.officerAssignments.find((o) => o.id === oaId)
    const person = oa ? state.people.find((p) => p.id === oa.personId) : undefined
    return person?.name ?? "an officer"
  }

  return (
    <>
      <PageHeader
        eyebrow="Commitment"
        title={commitment.title}
        description={commitment.outcome}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <CommitmentBadge status={commitment.status} />
            <ConfidenceBadge level={commitment.confidence} />
            {overdue ? <OverdueBadge /> : null}
          </div>
        }
      />

      {commitment.status === "blocked" && commitment.blockedReason ? (
        <div className="mb-8 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm">
          <span className="font-medium">Blocked — </span>
          {commitment.blockedReason}
        </div>
      ) : null}

      <Section title="The promise">
        <div className="rounded-xl border border-border/60 bg-card px-4 py-2 sm:px-5">
          <dl className="divide-y divide-border/50">
            {commitment.description ? (
              <InfoRow label="Description">{commitment.description}</InfoRow>
            ) : null}
            <InfoRow label="Owner">{ownerName}</InfoRow>
            <InfoRow label="Requested by">{requestedByName}</InfoRow>
            {commitment.dueDate ? (
              <InfoRow label="Due">{formatDate(commitment.dueDate)}</InfoRow>
            ) : null}
            {commitment.completedAt ? (
              <InfoRow label="Delivered">{formatDate(commitment.completedAt)}</InfoRow>
            ) : null}
            {commitment.verifiedAt ? (
              <InfoRow label="Verified">{formatDate(commitment.verifiedAt)}</InfoRow>
            ) : null}
            {linkedDecisions.length > 0 ? (
              <InfoRow label="Linked decisions">
                <ul className="list-disc space-y-1 pl-4">
                  {linkedDecisions.map((d) => (
                    <li key={d.id}>
                      <Link href="/decisions" className="hover:underline">
                        {d.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </InfoRow>
            ) : null}
            <InfoRow label="Move it forward">
              <CommitmentActions commitmentId={commitment.id} current={commitment.status} />
            </InfoRow>
          </dl>
        </div>
      </Section>

      <Section title="Success criteria" description="How the outcome is verified.">
        {commitment.successCriteria.length === 0 ? (
          <EmptyState title="No success criteria defined" />
        ) : (
          <ul className="space-y-2">
            {commitment.successCriteria.map((c) => (
              <li key={c} className="flex items-start gap-2 text-sm">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground/60" />
                {c}
              </li>
            ))}
          </ul>
        )}
      </Section>

      {dependencies.length > 0 || dependents.length > 0 ? (
        <Section title="Dependencies">
          <div className="space-y-3">
            {dependencies.map((c) => (
              <CommitmentRow
                key={c.id}
                commitment={c}
                ownerName={nameOf(c.ownerOfficerAssignmentId)}
              />
            ))}
            {dependents.length > 0 ? (
              <p className="text-xs text-muted-foreground">
                {dependents.length} other commitment{dependents.length > 1 ? "s depend" : " depends"} on this one.
              </p>
            ) : null}
          </div>
        </Section>
      ) : null}

      <Section title="Notes">
        <div className="space-y-3">
          {commitment.notes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No notes yet.</p>
          ) : (
            <ol className="space-y-2">
              {commitment.notes
                .slice()
                .reverse()
                .map((n, i) => (
                  <li key={`${n.at}-${i}`} className="rounded-lg border border-border/50 bg-card/40 px-4 py-3">
                    <p className="text-sm">{n.note}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {n.author} · {formatDateTime(n.at)}
                    </p>
                  </li>
                ))}
            </ol>
          )}
          <CommitmentNoteForm commitmentId={commitment.id} />
        </div>
      </Section>
    </>
  )
}
