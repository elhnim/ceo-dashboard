import { DecisionStage, enumValues } from "@/lib/console/domain/enums"
import { setDecisionStage } from "@/lib/console/services/console-service"

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = (await request.json()) as { stage?: string }
    if (!body.stage || !enumValues(DecisionStage).includes(body.stage as DecisionStage)) {
      return Response.json(
        { data: null, error: `stage must be one of ${enumValues(DecisionStage).join(", ")}` },
        { status: 400 },
      )
    }
    const decision = await setDecisionStage(id, body.stage as DecisionStage)
    return Response.json({ data: decision, error: null })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update decision stage"
    const status = message.includes("not found") ? 404 : 400
    return Response.json({ data: null, error: message }, { status })
  }
}
