import type { BusinessUpdate } from "@/types/database"
import {
  deleteBusiness,
  getBusiness,
  updateBusiness,
} from "@/lib/services/businesses"

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

function parseBusinessUpdate(value: unknown): BusinessUpdate {
  if (!value || typeof value !== "object") {
    throw new Error("Request body must be an object")
  }

  const data = value as Record<string, unknown>
  const parsed: BusinessUpdate = {}

  if (data.name !== undefined) {
    if (typeof data.name !== "string" || data.name.trim().length === 0) {
      throw new Error("Business name cannot be empty")
    }

    parsed.name = data.name
  }

  if (data.description !== undefined) {
    parsed.description =
      typeof data.description === "string" ? data.description : null
  }

  if (data.color !== undefined) {
    if (typeof data.color !== "string") {
      throw new Error("Business color must be a string")
    }

    parsed.color = data.color
  }

  if (data.display_order !== undefined) {
    if (typeof data.display_order !== "number") {
      throw new Error("display_order must be a number")
    }

    parsed.display_order = data.display_order
  }

  if (data.is_active !== undefined) {
    if (typeof data.is_active !== "boolean") {
      throw new Error("is_active must be a boolean")
    }

    parsed.is_active = data.is_active
  }

  return parsed
}

function getStatusFromMessage(message: string) {
  if (message === "Business not found") {
    return 404
  }

  if (
    message === "Request body must be an object" ||
    message === "Business name cannot be empty" ||
    message === "Business color must be a string" ||
    message === "display_order must be a number" ||
    message === "is_active must be a boolean"
  ) {
    return 400
  }

  if (message.includes("Supabase can’t read the CEO Dashboard tables yet.")) {
    return 503
  }

  return 500
}

export async function GET(_: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const business = await getBusiness(id)

    return Response.json({
      data: business,
      error: null,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load business"

    return Response.json(
      {
        data: null,
        error: message,
      },
      { status: getStatusFromMessage(message) }
    )
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const business = await updateBusiness(id, parseBusinessUpdate(await request.json()))

    return Response.json({
      data: business,
      error: null,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update business"

    return Response.json(
      {
        data: null,
        error: message,
      },
      { status: getStatusFromMessage(message) }
    )
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    await deleteBusiness(id)

    return Response.json({
      data: null,
      error: null,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to delete business"

    return Response.json(
      {
        data: null,
        error: message,
      },
      { status: getStatusFromMessage(message) }
    )
  }
}
