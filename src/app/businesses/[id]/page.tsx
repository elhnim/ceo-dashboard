import { notFound } from "next/navigation"

import { BusinessDetail } from "@/components/businesses/BusinessDetail"
import { BusinessesUnavailableState } from "@/components/businesses/BusinessesUnavailableState"
import { BusinessSchemaError, getBusiness } from "@/lib/services/businesses"
import { getVMV, getVMVHistory, VMVSchemaError } from "@/lib/services/vmv"
import type { Business, BusinessVMV, BusinessVMVHistory } from "@/types/database"

type BusinessDetailPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function BusinessDetailPage({
  params,
}: BusinessDetailPageProps) {
  const { id } = await params
  let business: Business
  let initialVMV: BusinessVMV | null = null
  let initialVMVHistory: BusinessVMVHistory[] = []
  let vmvUnavailableMessage: string | null = null

  try {
    business = await getBusiness(id)
  } catch (error) {
    if (error instanceof BusinessSchemaError) {
      return (
        <BusinessesUnavailableState
          title="Business details are unavailable"
          message={error.message}
        />
      )
    }

    notFound()
  }

  try {
    ;[initialVMV, initialVMVHistory] = await Promise.all([
      getVMV(id),
      getVMVHistory(id),
    ])
  } catch (error) {
    if (error instanceof VMVSchemaError) {
      vmvUnavailableMessage = error.message
    } else {
      throw error
    }
  }

  return (
    <BusinessDetail
      business={business}
      initialVMV={initialVMV}
      initialVMVHistory={initialVMVHistory}
      vmvUnavailableMessage={vmvUnavailableMessage}
    />
  )
}
