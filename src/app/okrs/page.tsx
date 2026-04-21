import { BusinessSchemaError, getBusinesses } from "@/lib/services/businesses"
import type { Business } from "@/types/database"
import { OKRsPageClient } from "@/components/okrs/OKRsPageClient"

export default async function OkrsPage() {
  let businesses: Business[] = []
  let loadError: string | null = null

  try {
    businesses = await getBusinesses()
  } catch (error) {
    if (error instanceof BusinessSchemaError) {
      loadError = error.message
    } else {
      loadError =
        error instanceof Error ? error.message : "Unable to load businesses"
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8">
      <OKRsPageClient businesses={businesses} loadError={loadError} />
    </div>
  )
}
