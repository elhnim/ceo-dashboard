import type { BusinessVMVUpdate } from "@/types/database"
import { getVMV, upsertVMV } from "@/lib/services/vmv"

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

function parseVMVUpdate(value: unknown): BusinessVMVUpdate {
  if (!value || typeof value !== "object") {
    throw new Error("Request body must be an object")
  }

  const data = value as Record<string, unknown>

  return {
    ...(data.vision !== undefined
      ? { vision: typeof data.vision === "string" ? data.vision : null }
      : {}),
    ...(data.mission !== undefined
      ? { mission: typeof data.mission === "string" ? data.mission : null }
      : {}),
    ...(data.values !== undefined
      ? { values: typeof data.values === "string" ? data.values : null }
      : {}),
  }
}

function getStatusFromMessage(message: string) {
  if (message === "Request body must be an object") {
    return 400
  }

  if (message.includes("Supabase can’t read the VMV tables yet.")) {
    return 503
  }

  return 500
}

export async function GET(_: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const vmv = await getVMV(id)

    return Response.json({
      data: vmv,
      error: null,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load strategic profile"

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
    const vmv = await upsertVMV(id, parseVMVUpdate(await request.json()))

    return Response.json({
      data: vmv,
      error: null,
    })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to update strategic profile"

    return Response.json(
      {
        data: null,
        error: message,
      },
      { status: getStatusFromMessage(message) }
    )
  }
}
