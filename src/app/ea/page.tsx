import { EaChat } from "@/components/console/ea-chat"
import { EaWorkspacePanels } from "@/components/console/ea-workspace-panels"
import { PageHeader } from "@/components/console/primitives"
import { DecisionStatus } from "@/lib/console/domain/enums"
import { activeCommitments, sortByPriority } from "@/lib/console/domain/logic"
import {
  getConversation,
  getState,
  listDecisions,
} from "@/lib/console/services/console-service"

export const dynamic = "force-dynamic"

export default async function EaWorkspacePage() {
  const [conversation, decisions, state] = await Promise.all([
    getConversation(),
    listDecisions(),
    getState(),
  ])
  const pending = sortByPriority(
    decisions.filter((d) => d.status === DecisionStatus.Waiting),
    (d) => d.priority,
  )
  const commitments = activeCommitments(state)

  return (
    <>
      <PageHeader
        eyebrow="Executive Assistant"
        title="Your executive office"
        description="Vera reads the live state of the organization. Converse on the left; her recommendations, research, drafts, and your pending decisions sit alongside."
      />
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <EaChat initial={conversation} />
        </div>
        <aside className="lg:col-span-2">
          <EaWorkspacePanels
            pendingDecisions={pending}
            activeCommitments={commitments}
          />
        </aside>
      </div>
    </>
  )
}
