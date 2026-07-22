import { AssignmentRow } from "@/components/console/assignment-row"
import { EmptyState, PageHeader, Section } from "@/components/console/primitives"
import {
  WORK_ASSIGNMENT_STATUS_ORDER,
  WorkAssignmentStatusLabel,
} from "@/lib/console/domain/enums"
import { getState } from "@/lib/console/services/console-service"

export const dynamic = "force-dynamic"

export default async function WorkPage() {
  const state = await getState()
  const ownerName = (id: string) => {
    const oa = state.officerAssignments.find((o) => o.id === id)
    const person = oa ? state.people.find((p) => p.id === oa.personId) : undefined
    return person?.name ?? "an officer"
  }

  const groups = WORK_ASSIGNMENT_STATUS_ORDER.map((status) => ({
    status,
    assignments: state.workAssignments.filter((a) => a.status === status),
  })).filter((g) => g.assignments.length > 0)

  return (
    <>
      <PageHeader
        eyebrow="Work"
        title="The organization's commitments"
        description="Every assignment and its outcome, grouped by status — blocked and review items surface first so nothing stalls silently."
      />

      {state.workAssignments.length === 0 ? (
        <EmptyState title="No assignments yet" />
      ) : (
        groups.map((group) => (
          <Section
            key={group.status}
            title={`${WorkAssignmentStatusLabel[group.status]} (${group.assignments.length})`}
          >
            <div className="space-y-3">
              {group.assignments.map((a) => (
                <AssignmentRow key={a.id} assignment={a} ownerName={ownerName(a.ownerOfficerAssignmentId)} />
              ))}
            </div>
          </Section>
        ))
      )}
    </>
  )
}
