import type { Session } from "next-auth"
import type { NextRequest } from "next/server"

import { requireAuth } from "@/lib/auth"
import { generateBrief } from "@/lib/pipeline/generate-brief"
import { syncAllModules } from "@/lib/pipeline/sync-all-modules"

function getAccessToken(session: Session | null) {
  if (!session?.accessToken) {
    throw new Error("Microsoft access token is not available")
  }

  return session.accessToken
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const syncResult = await syncAllModules(getAccessToken(session))
    const shouldRegenerate = request.nextUrl.searchParams.get("regenerate") === "true"
    const brief = shouldRegenerate
      ? await generateBrief("manual", {
          dataAsOf: syncResult.completedAt,
          stage1CompletedAt: syncResult.completedAt,
        })
      : null

    return Response.json({
      data: {
        syncedAt: syncResult.completedAt,
        results: syncResult.results,
        brief,
      },
      error: null,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to start a sync"

    return Response.json({ data: null, error: message }, { status: 500 })
  }
}
