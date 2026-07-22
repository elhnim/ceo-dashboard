import { CommitmentRow } from "@/components/console/commitment-row"
import { DelegateButton } from "@/components/console/delegate-dialog"
import { EmptyState, PageHeader, Section } from "@/components/console/primitives"
import { CommitmentStatus } from "@/lib/console/domain/enums"
import { isOverdue } from "@/lib/console/domain/logic"
import { getState } from "@/lib/console/services/console-service"
import type { Commitment } from "@/types/console"

export const dynamic = "force-dynamic"

const GROUPS: Array<{ title: string; description?: string; filter: (c: Commitment) => boolean }> = [
  {
    title: "Needs your verification",
    description: "Delivered outcomes waiting for your sign-off.",
    filter: (c) => c.status === CommitmentStatus.Completed,
  },
  { title: "Blocked", filter: (c) => c.status === CommitmentStatus.Blocked },
  { title: "In progress", filter: (c) => c.status === CommitmentStatus.InProgress },
  { title: "Committed", filter: (c) => c.status === CommitmentStatus.Committed },
  { title: "Drafts", filter: (c) => c.status === CommitmentStatus.Draft },
  { title: "Verified", filter: (c) => c.status === CommitmentStatus.Verified },
]

export default async function CommitmentsPage() {
  const state = await getState()
  const now = new Date().toISOString()
  const ownerName = (id: string) => {
    const oa = state.officerAssignments.find((o) => o.id === id)
    const person = oa ? state.people.find((p) => p.id === oa.personId) : undefined
    return person?.name ?? "an officer"
  }

  return (
    <>
      <PageHeader
        eyebrow="Commitments"
        title="Promises to deliver outcomes"
        description="A commitment is not a task — it is an officer's promise to deliver an outcome, with success criteria you verify. Blocked and delivered items surface first."
        actions={<DelegateButton />}
      />

      {state.commitments.length === 0 ? (
        <EmptyState
          title="No commitments yet"
          description="Delegate an outcome to create the first one."
        />
      ) : (
        GROUPS.map((group) => {
          const items = state.commitments.filter(group.filter)
          if (items.length === 0) return null
          return (
            <Section
              key={group.title}
              title={`${group.title} (${items.length})`}
              description={group.description}
            >
              <div className="space-y-3">
                {items.map((c) => (
                  <CommitmentRow
                    key={c.id}
                    commitment={c}
                    ownerName={ownerName(c.ownerOfficerAssignmentId)}
                    overdue={isOverdue(c, now)}
                  />
                ))}
              </div>
            </Section>
          )
        })
      )}
    </>
  )
}
