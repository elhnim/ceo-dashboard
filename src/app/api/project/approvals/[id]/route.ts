import { resolveApproval } from "@/lib/console/project/service"

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = (await request.json()) as { resolution?: string; rationale?: string }
    if (body.resolution !== "approved" && body.resolution !== "deferred") {
      return Response.json(
        { data: null, error: "resolution must be 'approved' or 'deferred'" },
        { status: 400 },
      )
    }
    const approval = await resolveApproval(id, body.resolution, body.rationale)
    return Response.json({ data: approval, error: null })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to resolve the approval"
    const status = message.includes("not found") ? 404 : 400
    return Response.json({ data: null, error: message }, { status })
  }
}
