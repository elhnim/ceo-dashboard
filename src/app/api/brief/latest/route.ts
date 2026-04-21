import { requireAuth } from "@/lib/auth"
import { getBriefSyncHealth, getLatestBrief } from "@/lib/services/briefs"

export async function GET() {
  try {
    await requireAuth()

    const [brief, syncHealth] = await Promise.all([
      getLatestBrief(),
      getBriefSyncHealth(),
    ])

    return Response.json({ data: brief, syncHealth, error: null })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load the latest brief"

    return Response.json(
      {
        data: null,
        syncHealth: {
          hasErrors: false,
          latestSyncAt: null,
          latestError: null,
        },
        error: message,
      },
      { status: 500 }
    )
  }
}
