import { createKeyResult, getObjective } from "@/lib/services/okrs"
import {
  getOKRStatusCode,
  parseKeyResultInsert,
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
      data: objective.key_results ?? [],
      error: null,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load key results"

    return Response.json(
      {
        data: null,
        error: message,
      },
      { status: getOKRStatusCode(message) }
    )
  }
}

export async function POST(request: Request) {
  try {
    const keyResult = await createKeyResult(
      parseKeyResultInsert(await request.json())
    )

    return Response.json(
      {
        data: keyResult,
        error: null,
      },
      { status: 201 }
    )
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create key result"

    return Response.json(
      {
        data: null,
        error: message,
      },
      { status: getOKRStatusCode(message) }
    )
  }
}
