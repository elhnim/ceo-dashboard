import { auth } from "@/lib/auth"
import { getDoThisNext } from "@/lib/services/do-this-next"
import { TaskSchemaError } from "@/lib/services/tasks-schema"

export async function GET() {
  const session = await auth()

  if (!session?.user) {
    return Response.json({ task: null, error: "Unauthorized" }, { status: 401 })
  }

  try {
    const task = await getDoThisNext()
    return Response.json({ task })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load next task"
    const status = error instanceof TaskSchemaError ? 503 : 500

    return Response.json({ task: null, error: message }, { status })
  }
}
