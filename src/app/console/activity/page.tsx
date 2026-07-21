import { ActivityList } from "@/components/console/activity-list"
import { PageHeader, Section } from "@/components/console/primitives"
import { getActivity } from "@/lib/console/services/console-service"

export const dynamic = "force-dynamic"

export default async function ActivityPage() {
  const events = await getActivity()

  return (
    <>
      <PageHeader
        eyebrow="Organization timeline"
        title="Activity"
        description="A chronological record of everything the organization has done — assignments, deliverables, decisions, and blockers."
      />
      <Section title="Recent activity">
        <ActivityList events={events} />
      </Section>
    </>
  )
}
