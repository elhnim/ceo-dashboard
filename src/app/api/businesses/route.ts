import type { BusinessInsert } from "@/types/database"
import {
  BusinessSchemaError,
  createBusiness,
  getBusinesses,
} from "@/lib/services/businesses"

function parseBusinessInsert(value: unknown): BusinessInsert {
  if (!value || typeof value !== "object") {
    throw new Error("Request body must be an object")
  }

  const data = value as Record<string, unknown>

  if (typeof data.name !== "string" || data.name.trim().length === 0) {
    throw new Error("Business name is required")
  }

  return {
    name: data.name,
    description:
      typeof data.description === "string" ? data.description : undefined,
    color: typeof data.color === "string" ? data.color : undefined,
    logo_url: typeof data.logo_url === "string" ? data.logo_url : undefined,
    display_order:
      typeof data.display_order === "number" ? data.display_order : undefined,
    is_active: typeof data.is_active === "boolean" ? data.is_active : undefined,
  }
}

export async function GET() {
  try {
    const businesses = await getBusinesses()
    return Response.json({
      data: businesses,
      error: null,
    })
  } catch (error) {
    const status = error instanceof BusinessSchemaError ? 503 : 500

    return Response.json(
      {
        data: null,
        error: error instanceof Error ? error.message : "Unable to load businesses",
      },
      { status }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = parseBusinessInsert(await request.json())
    const business = await createBusiness(body)

    return Response.json(
      {
        data: business,
        error: null,
      },
      { status: 201 }
    )
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create business"
    const status =
      message === "Business name is required"
        ? 400
        : error instanceof BusinessSchemaError
          ? 503
          : 500

    return Response.json(
      {
        data: null,
        error: message,
      },
      { status }
    )
  }
}
