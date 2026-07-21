import { EaChat } from "@/components/console/ea-chat"
import { PageHeader } from "@/components/console/primitives"
import { getConversation } from "@/lib/console/services/console-service"

export const dynamic = "force-dynamic"

export default async function EaPage() {
  const conversation = await getConversation()

  return (
    <>
      <PageHeader
        eyebrow="Executive Assistant"
        title="Talk to Vera"
        description="Your EA reads the live state of the organization. Ask for an update, triage what needs you, or prepare your brief."
      />
      <EaChat initial={conversation} />
    </>
  )
}
