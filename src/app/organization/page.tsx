import { OfficerStatusRow } from "@/components/console/officer-status-row"
import { PageHeader, Section } from "@/components/console/primitives"
import { listOfficers } from "@/lib/console/services/console-service"

export const dynamic = "force-dynamic"

export default async function OrganizationPage() {
  const officers = await listOfficers()
  const director = officers.filter((o) => o.role.title === "Product Director")
  const council = officers.filter((o) => o.role.title !== "Product Director")

  return (
    <>
      <PageHeader
        eyebrow="Organization"
        title="Your organization"
        description="The officers executing your intent. Open anyone to see their charter, their commitments, and what they need from you."
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
