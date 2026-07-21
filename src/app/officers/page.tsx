import { OfficerStatusRow } from "@/components/console/officer-status-row"
import { PageHeader, Section } from "@/components/console/primitives"
import { listOfficers } from "@/lib/console/services/console-service"

export const dynamic = "force-dynamic"

export default async function OfficersPage() {
  const officers = await listOfficers()
  const director = officers.filter((o) => o.role.title === "Product Director")
  const council = officers.filter((o) => o.role.title !== "Product Director")

  return (
    <>
      <PageHeader
        eyebrow="Officer directory"
        title="Officers"
        description="Your persistent AI team. Open an officer to see their charter, current work, and the questions or blockers they've raised."
      />

      <Section title="Founding Council">
        <div className="space-y-3">
          {council.map((summary) => (
            <OfficerStatusRow key={summary.officerAssignment.id} summary={summary} />
          ))}
        </div>
      </Section>

      {director.length > 0 ? (
        <Section title="Director">
          <div className="space-y-3">
            {director.map((summary) => (
              <OfficerStatusRow key={summary.officerAssignment.id} summary={summary} />
            ))}
          </div>
        </Section>
      ) : null}
    </>
  )
}
