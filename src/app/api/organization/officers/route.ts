import { listOfficerOptions } from "@/lib/console/services/console-service"

export async function GET() {
  const officers = await listOfficerOptions()
  return Response.json({ data: officers, error: null })
}
