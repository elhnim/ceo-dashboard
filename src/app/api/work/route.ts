import { createWorkAssignment, getWorkBoard } from "@/lib/console/services/console-service"
import type { NewWorkAssignmentInput } from "@/lib/console/domain/transitions"

export async function GET() {
  const board = await getWorkBoard()
  return Response.json({ data: board, error: null })
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<NewWorkAssignmentInput>
    if (!body.title || !body.objective || !body.ownerOfficerAssignmentId) {
      return Response.json(
        { data: null, error: "title, objective, and ownerOfficerAssignmentId are required" },
        { status: 400 },
      )
    }
    const assignment = await createWorkAssignment(body as NewWorkAssignmentInput)
    return Response.json({ data: assignment, error: null }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create assignment"
    return Response.json({ data: null, error: message }, { status: 400 })
  }
}
