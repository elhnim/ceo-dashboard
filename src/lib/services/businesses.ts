import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { Business, BusinessInsert, BusinessUpdate } from "@/types/database"

function normalizeBusinessInsert(
  data: BusinessInsert,
  displayOrder: number
): BusinessInsert {
  return {
    name: data.name.trim(),
    description: data.description?.trim() || null,
    color: data.color || "#6366f1",
    logo_url: data.logo_url ?? null,
    display_order: data.display_order ?? displayOrder,
    is_active: data.is_active ?? true,
  }
}

function normalizeBusinessUpdate(data: BusinessUpdate): BusinessUpdate {
  return {
    ...(data.name !== undefined ? { name: data.name.trim() } : {}),
    ...(data.description !== undefined
      ? { description: data.description?.trim() || null }
      : {}),
    ...(data.color !== undefined ? { color: data.color } : {}),
    ...(data.logo_url !== undefined ? { logo_url: data.logo_url ?? null } : {}),
    ...(data.display_order !== undefined
      ? { display_order: data.display_order }
      : {}),
    ...(data.is_active !== undefined ? { is_active: data.is_active } : {}),
  }
}

async function getBusinessesQuery(includeInactive = false) {
  const supabase = await createClient()
  let query = supabase
    .from("businesses")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true })

  if (!includeInactive) {
    query = query.eq("is_active", true)
  }

  return query
}

export async function getBusinesses(): Promise<Business[]> {
  const { data, error } = await getBusinessesQuery()

  if (error) {
    throw new Error(error.message)
  }

  return data satisfies Business[]
}

export async function getBusiness(id: string): Promise<Business> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !data) {
    throw new Error("Business not found")
  }

  return data satisfies Business
}

export async function createBusiness(data: BusinessInsert): Promise<Business> {
  const supabase = await createClient()
  const existingBusinesses = await getBusinesses()
  const displayOrder = existingBusinesses.length
  const payload = normalizeBusinessInsert(data, displayOrder)

  const { data: createdBusiness, error } = await supabase
    .from("businesses")
    .insert(payload)
    .select("*")
    .single()

  if (error || !createdBusiness) {
    throw new Error(error?.message || "Unable to create business")
  }

  return createdBusiness satisfies Business
}

export async function updateBusiness(
  id: string,
  data: BusinessUpdate
): Promise<Business> {
  const supabase = await createClient()
  const payload = normalizeBusinessUpdate(data)

  const { data: updatedBusiness, error } = await supabase
    .from("businesses")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single()

  if (error || !updatedBusiness) {
    throw new Error(error?.message || "Unable to update business")
  }

  return updatedBusiness satisfies Business
}

export async function deleteBusiness(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("businesses")
    .update({ is_active: false })
    .eq("id", id)

  if (error) {
    throw new Error(error.message)
  }
}

export async function reorderBusinesses(ids: string[]): Promise<void> {
  const supabase = await createClient()

  for (const [index, id] of ids.entries()) {
    const { error } = await supabase
      .from("businesses")
      .update({ display_order: index })
      .eq("id", id)

    if (error) {
      throw new Error(error.message)
    }
  }
}
