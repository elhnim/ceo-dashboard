import { auth } from "@/lib/auth"
import { getIncompleteTasks } from "@/lib/services/tasks"
import { TaskSchemaError } from "@/lib/services/tasks-schema"

function getStatusCode(error: unknown) {
  if (error instanceof TaskSchemaError) {
    return 503
  }

  return 500
}

export async function GET() {
  const session = await auth()

  if (!session?.user) {
    return Response.json({ tasks: [], error: "Unauthorized" }, { status: 401 })
  }

  try {
    const tasks = await getIncompleteTasks()
    return Response.json({ tasks })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load tasks"

    return Response.json(
      { tasks: [], error: message },
      { status: getStatusCode(error) },
    )
  }
}
