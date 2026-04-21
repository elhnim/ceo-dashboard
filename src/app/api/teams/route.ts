import { requireAuth } from "@/lib/auth"
import { getTeamsCacheRecords, TeamsSchemaError } from "@/lib/services/teams"

export async function GET() {
  try {
    await requireAuth()
    const records = await getTeamsCacheRecords()

    return Response.json({ records })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load Teams activity"
    const status = error instanceof TeamsSchemaError ? 503 : 500

    return Response.json({ records: [], error: message }, { status })
  }
}
