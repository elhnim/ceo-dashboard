import { getVMVHistory } from "@/lib/services/vmv"

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

function getStatusFromMessage(message: string) {
  if (message.includes("Supabase can’t read the VMV tables yet.")) {
    return 503
  }

  return 500
}

export async function GET(_: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const history = await getVMVHistory(id)

    return Response.json({
      data: history,
      error: null,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load VMV history"

    return Response.json(
      {
        data: null,
        error: message,
      },
      { status: getStatusFromMessage(message) }
    )
  }
}
