import { addCommitmentNote } from "@/lib/console/services/console-service"

type RouteContext = { params: Promise<{ id: string }> }

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = (await request.json()) as { note?: string }
    if (!body.note?.trim()) {
      return Response.json({ data: null, error: "note is required" }, { status: 400 })
    }
    const commitment = await addCommitmentNote(id, body.note)
    return Response.json({ data: commitment, error: null })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to add note"
    const status = message.includes("not found") ? 404 : 400
    return Response.json({ data: null, error: message }, { status })
  }
}
