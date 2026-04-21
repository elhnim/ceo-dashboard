import { deleteKeyResult, updateKeyResult } from "@/lib/services/okrs"
import {
  getOKRStatusCode,
  parseKeyResultUpdate,
} from "@/app/api/okrs/route-helpers"

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const keyResult = await updateKeyResult(
      id,
      parseKeyResultUpdate(await request.json())
    )

    return Response.json({
      data: keyResult,
      error: null,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update key result"

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
    await deleteKeyResult(id)

    return Response.json({
      data: null,
      error: null,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to delete key result"

    return Response.json(
      {
        data: null,
        error: message,
      },
      { status: getOKRStatusCode(message) }
    )
  }
}
