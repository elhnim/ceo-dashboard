import { BusinessList } from "@/components/businesses/BusinessList"
import { BusinessesUnavailableState } from "@/components/businesses/BusinessesUnavailableState"
import { BusinessSchemaError, getBusinesses } from "@/lib/services/businesses"
import type { Business } from "@/types/database"

export default async function BusinessesPage() {
  let businesses: Business[] = []
  let unavailableMessage: string | null = null

  try {
    businesses = await getBusinesses()
  } catch (error) {
    if (error instanceof BusinessSchemaError) {
      unavailableMessage = error.message
    } else {
      throw error
    }
  }

  if (unavailableMessage) {
    return <BusinessesUnavailableState message={unavailableMessage} />
  }

  return <BusinessList initialBusinesses={businesses} />
}
