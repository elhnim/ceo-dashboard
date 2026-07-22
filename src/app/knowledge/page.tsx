import { BrainIcon } from "lucide-react"

import { PageHeader, Section } from "@/components/console/primitives"
import { Timeline } from "@/components/console/timeline"
import { getActivity } from "@/lib/console/services/console-service"

export const dynamic = "force-dynamic"

export default async function KnowledgePage() {
  const events = await getActivity()

  return (
    <>
      <PageHeader
        eyebrow="Knowledge"
        title="What the organization knows"
        description="Today this is the organizational record — every commitment made, decision taken, and deliverable produced. In future milestones it becomes the Organizational Mind."
      />

      <div className="mb-10 flex items-start gap-4 rounded-xl border border-dashed border-border/70 bg-card/30 px-5 py-4">
        <BrainIcon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
        <p className="text-sm leading-6 text-muted-foreground">
          <span className="font-medium text-foreground">
            Knowledge will become the Organizational Mind in future milestones
          </span>{" "}
          — atomic knowledge, retrieval, context assembly, promotion, and
          forgetting. The provider seam already exists; nothing is implemented
          yet by design.
        </p>
      </div>

      <Section
        title="Organization timeline"
        description="Commitments, decisions, reviews, and delivered milestones — chronological, newest first."
      >
        <Timeline events={events} />
      </Section>
    </>
  )
}
