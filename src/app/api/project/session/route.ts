import { beginSession } from "@/lib/console/project/service"

export async function POST() {
  try {
    const session = await beginSession()
    if (!session) {
      return Response.json(
        { data: null, error: "No session-ready topic in the active sprint" },
        { status: 404 },
      )
    }
    return Response.json({ data: session, error: null })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to begin the session"
    return Response.json({ data: null, error: message }, { status: 500 })
  }
}
