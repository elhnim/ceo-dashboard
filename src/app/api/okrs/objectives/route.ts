import { createObjective, getObjectives } from "@/lib/services/okrs"
import {
  getOKRStatusCode,
  parseObjectiveInsert,
} from "@/app/api/okrs/route-helpers"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get("businessId")

    if (!businessId) {
      throw new Error("business_id is required")
    }

    const objectives = await getObjectives(businessId)

    return Response.json({
      data: objectives,
      error: null,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load objectives"

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
    const objective = await createObjective(
      parseObjectiveInsert(await request.json())
    )

    return Response.json(
      {
        data: objective,
        error: null,
      },
      { status: 201 }
    )
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create objective"

    return Response.json(
      {
        data: null,
        error: message,
      },
      { status: getOKRStatusCode(message) }
    )
  }
}
