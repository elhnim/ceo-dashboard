import { generateBrief } from "@/lib/console/services/console-service"

export async function POST() {
  try {
    const brief = await generateBrief()
    return Response.json({ data: brief, error: null })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to generate brief"
    return Response.json({ data: null, error: message }, { status: 500 })
  }
}
