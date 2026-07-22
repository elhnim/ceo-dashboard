import { createCommitment, listCommitments } from "@/lib/console/services/console-service"
import type { NewCommitmentInput } from "@/lib/console/domain/transitions"

export async function GET() {
  const commitments = await listCommitments()
  return Response.json({ data: commitments, error: null })
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<NewCommitmentInput>
    if (!body.title || !body.outcome || !body.ownerOfficerAssignmentId) {
      return Response.json(
        { data: null, error: "title, outcome, and ownerOfficerAssignmentId are required" },
        { status: 400 },
      )
    }
    const commitment = await createCommitment(body as NewCommitmentInput)
    return Response.json({ data: commitment, error: null }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create commitment"
    const status = message.includes("not found") ? 404 : 400
    return Response.json({ data: null, error: message }, { status })
  }
}
