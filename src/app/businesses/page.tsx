import { BusinessList } from "@/components/businesses/BusinessList"
import { getBusinesses } from "@/lib/services/businesses"

export default async function BusinessesPage() {
  const businesses = await getBusinesses()

  return <BusinessList initialBusinesses={businesses} />
}
