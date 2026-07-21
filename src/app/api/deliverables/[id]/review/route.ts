import { reviewDeliverable } from "@/lib/console/services/console-service"
import type { DeliverableReviewOutcome } from "@/lib/console/domain/transitions"

type RouteContext = { params: Promise<{ id: string }> }

const OUTCOMES: DeliverableReviewOutcome[] = ["approve", "request-revision", "reject"]

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = (await request.json()) as { outcome?: string; comment?: string }

    if (!body.outcome || !OUTCOMES.includes(body.outcome as DeliverableReviewOutcome)) {
      return Response.json(
        { data: null, error: `outcome must be one of ${OUTCOMES.join(", ")}` },
        { status: 400 },
      )
    }

    const deliverable = await reviewDeliverable(
      id,
      body.outcome as DeliverableReviewOutcome,
      body.comment ?? "",
    )
    return Response.json({ data: deliverable, error: null })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to review deliverable"
    const status = message.includes("not found") ? 404 : 400
    return Response.json({ data: null, error: message }, { status })
  }
}
