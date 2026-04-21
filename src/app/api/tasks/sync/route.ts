import { auth } from "@/lib/auth"
import { getIncompleteTasks } from "@/lib/services/tasks"
import { syncTasks } from "@/lib/services/tasks-sync"
import { MicrosoftGraphError } from "@/lib/services/microsoft-graph"
import { TaskSchemaError } from "@/lib/services/tasks-schema"

export async function POST() {
  const session = await auth()

  if (!session?.user) {
    return Response.json({ tasks: [], error: "Unauthorized" }, { status: 401 })
  }

  if (!session.accessToken) {
    return Response.json(
      { tasks: [], error: "Microsoft access token is not available for this session." },
      { status: 401 },
    )
  }

  try {
    await syncTasks(session.accessToken)
    const tasks = await getIncompleteTasks()

    return Response.json({ tasks, syncedAt: new Date().toISOString() })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to sync tasks"
    const status =
      error instanceof MicrosoftGraphError
        ? error.status
        : error instanceof TaskSchemaError
          ? 503
          : 500

    return Response.json({ tasks: [], error: message }, { status })
  }
}
