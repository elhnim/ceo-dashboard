import { auth } from "@/lib/auth"
import { getTaskCacheById, updateTaskQuadrant } from "@/lib/services/tasks"
import { syncTasks } from "@/lib/services/tasks-sync"
import { MicrosoftGraphError } from "@/lib/services/microsoft-graph"
import { TaskSchemaError } from "@/lib/services/tasks-schema"
import { MicrosoftToDoProvider } from "@/lib/services/tasks-todo"

type TaskQuadrant = "do" | "schedule" | "delegate" | "eliminate"

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

type TaskMutation =
  | { action: "complete" }
  | { quadrant: TaskQuadrant }

function parseBody(value: unknown): TaskMutation {
  if (!value || typeof value !== "object") {
    throw new Error("Request body must be an object")
  }

  const payload = value as {
    action?: unknown
    quadrant?: unknown
  }

  if (payload.action === "complete") {
    return { action: "complete" }
  }

  if (
    payload.quadrant === "do" ||
    payload.quadrant === "schedule" ||
    payload.quadrant === "delegate" ||
    payload.quadrant === "eliminate"
  ) {
    return { quadrant: payload.quadrant }
  }

  throw new Error("Invalid task mutation")
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await auth()

  if (!session?.user) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await context.params
    const mutation = parseBody(await request.json())

    if ("quadrant" in mutation) {
      const task = await updateTaskQuadrant(id, mutation.quadrant)
      return Response.json({ ok: true, task })
    }

    if (!session.accessToken) {
      return Response.json(
        { ok: false, error: "Microsoft access token is not available for this session." },
        { status: 401 },
      )
    }

    const cachedTask = await getTaskCacheById(id)
    const provider = new MicrosoftToDoProvider(session.accessToken)
    await provider.updateTaskStatus(cachedTask.external_id, "completed")
    await syncTasks(session.accessToken)

    return Response.json({ ok: true })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update task"
    const status =
      message === "Request body must be an object" || message === "Invalid task mutation"
        ? 400
        : error instanceof MicrosoftGraphError
          ? error.status
          : error instanceof TaskSchemaError
            ? 503
            : 500

    return Response.json({ ok: false, error: message }, { status })
  }
}
