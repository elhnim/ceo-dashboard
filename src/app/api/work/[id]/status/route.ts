import { enumValues, WorkAssignmentStatus } from "@/lib/console/domain/enums"
import { setWorkStatus } from "@/lib/console/services/console-service"
import type { WorkAssignment } from "@/types/console"

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = (await request.json()) as {
      status?: string
      reason?: string
      note?: string
    }

    if (
      !body.status ||
      !enumValues(WorkAssignmentStatus).includes(body.status as WorkAssignment["status"])
    ) {
      return Response.json(
        { data: null, error: `status must be one of ${enumValues(WorkAssignmentStatus).join(", ")}` },
        { status: 400 },
      )
    }

    const assignment = await setWorkStatus(id, body.status as WorkAssignment["status"], {
      reason: body.reason,
      note: body.note,
    })
    return Response.json({ data: assignment, error: null })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update assignment"
    const status = message.includes("not found") ? 404 : 400
    return Response.json({ data: null, error: message }, { status })
  }
}
