import { enumValues, DecisionAction } from "@/lib/console/domain/enums"
import { getDecision, resolveDecision } from "@/lib/console/services/console-service"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params
  const decision = await getDecision(id)
  if (!decision) {
    return Response.json({ data: null, error: "Decision not found" }, { status: 404 })
  }
  return Response.json({ data: decision, error: null })
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = (await request.json()) as { action?: string; rationale?: string }
    const action = body.action

    if (!action || !enumValues(DecisionAction).includes(action as DecisionAction)) {
      return Response.json(
        { data: null, error: `action must be one of ${enumValues(DecisionAction).join(", ")}` },
        { status: 400 },
      )
    }

    const decision = await resolveDecision(id, action as DecisionAction, body.rationale)
    return Response.json({ data: decision, error: null })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to resolve decision"
    const status = message.includes("not found") ? 404 : 400
    return Response.json({ data: null, error: message }, { status })
  }
}
