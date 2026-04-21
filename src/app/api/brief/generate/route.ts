import { requireAuth } from "@/lib/auth"
import { generateBrief } from "@/lib/pipeline/generate-brief"

export async function POST() {
  try {
    await requireAuth()
    const brief = await generateBrief("manual")

    return Response.json({ data: brief, error: null })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to generate a brief"

    return Response.json({ data: null, error: message }, { status: 500 })
  }
}
