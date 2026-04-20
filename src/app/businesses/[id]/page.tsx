import { notFound } from "next/navigation"

import { BusinessDetail } from "@/components/businesses/BusinessDetail"
import { getBusiness } from "@/lib/services/businesses"

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
  } catch {
    notFound()
  }

  return <BusinessDetail business={business} />
}
