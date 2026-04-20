import { notFound } from "next/navigation"

import { BusinessDetail } from "@/components/businesses/BusinessDetail"
import { BusinessesUnavailableState } from "@/components/businesses/BusinessesUnavailableState"
import { BusinessSchemaError, getBusiness } from "@/lib/services/businesses"

type BusinessDetailPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function BusinessDetailPage({
  params,
}: BusinessDetailPageProps) {
  const { id } = await params
  let business

  try {
    business = await getBusiness(id)
  } catch (error) {
    if (error instanceof BusinessSchemaError) {
      return <BusinessesUnavailableState title="Business details are unavailable" message={error.message} />
    }

    notFound()
  }

  return <BusinessDetail business={business} />
}
