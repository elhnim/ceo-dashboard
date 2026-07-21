import { getConversation, sendEaMessage } from "@/lib/console/services/console-service"

export async function GET() {
  const conversation = await getConversation()
  return Response.json({ data: conversation, error: null })
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { message?: string }
    const message = body.message?.trim()
    if (!message) {
      return Response.json({ data: null, error: "message is required" }, { status: 400 })
    }
    const result = await sendEaMessage(message)
    return Response.json({ data: result, error: null })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to reach the Executive Assistant"
    return Response.json({ data: null, error: message }, { status: 500 })
  }
}
