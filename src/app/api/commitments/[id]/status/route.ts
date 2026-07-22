import { CommitmentStatus, enumValues } from "@/lib/console/domain/enums"
import { setCommitmentStatus } from "@/lib/console/services/console-service"
import type { Commitment } from "@/types/console"

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
      !enumValues(CommitmentStatus).includes(body.status as Commitment["status"])
    ) {
      return Response.json(
        { data: null, error: `status must be one of ${enumValues(CommitmentStatus).join(", ")}` },
        { status: 400 },
      )
    }
    const commitment = await setCommitmentStatus(id, body.status as Commitment["status"], {
      reason: body.reason,
      note: body.note,
    })
    return Response.json({ data: commitment, error: null })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update commitment"
    const status = message.includes("not found") ? 404 : 400
    return Response.json({ data: null, error: message }, { status })
  }
}
