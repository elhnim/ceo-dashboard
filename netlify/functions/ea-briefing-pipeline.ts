import type { Config } from "@netlify/functions"

import { generateBrief } from "../../src/lib/pipeline/generate-brief"
import { syncAllModules } from "../../src/lib/pipeline/sync-all-modules"

function getServiceAccessToken() {
  const token = process.env.MICROSOFT_SERVICE_ACCESS_TOKEN

  if (!token) {
    throw new Error("Missing required environment variable: MICROSOFT_SERVICE_ACCESS_TOKEN")
  }

  return token
}

export default async function handler() {
  try {
    const syncResult = await syncAllModules(getServiceAccessToken())
    await generateBrief("scheduled", {
      dataAsOf: syncResult.completedAt,
      stage1CompletedAt: syncResult.completedAt,
    })

    return {
      statusCode: 200,
      body: JSON.stringify({ syncedAt: syncResult.completedAt }),
    }
  } catch (error) {
    console.error("EA Briefing pipeline failed:", error)

    return {
      statusCode: 500,
      body: JSON.stringify({
        error:
          error instanceof Error ? error.message : "EA Briefing pipeline failed",
      }),
    }
  }
}

export const config: Config = {
  schedule: "@daily",
}
