import {
  deleteObjective,
  getObjective,
  updateObjective,
} from "@/lib/services/okrs"
import {
  getOKRStatusCode,
  parseObjectiveUpdate,
} from "@/app/api/okrs/route-helpers"

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function GET(_: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const objective = await getObjective(id)

    return Response.json({
      data: objective,
      error: null,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load objective"

    return Response.json(
      {
        data: null,
        error: message,
      },
      { status: getOKRStatusCode(message) }
    )
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const objective = await updateObjective(
      id,
      parseObjectiveUpdate(await request.json())
    )

    return Response.json({
      data: objective,
      error: null,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update objective"

    return Response.json(
      {
        data: null,
        error: message,
      },
      { status: getOKRStatusCode(message) }
    )
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    await deleteObjective(id)

    return Response.json({
      data: null,
      error: null,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to delete objective"

    return Response.json(
      {
        data: null,
        error: message,
      },
      { status: getOKRStatusCode(message) }
    )
  }
}
