import "server-only"

import { createClient } from "@/lib/supabase/server"
import type {
  BusinessVMV,
  BusinessVMVHistory,
  BusinessVMVUpdate,
} from "@/types/database"

export class VMVSchemaError extends Error {
  constructor(
    message = "Supabase can’t read the strategic profile tables for this business yet."
  ) {
    super(message)
    this.name = "VMVSchemaError"
  }
}

function formatVMVError(message: string) {
  if (message.includes("schema cache")) {
    return new VMVSchemaError(
      "Supabase can’t read the VMV tables yet. Re-run the database schema in Supabase SQL Editor or refresh the project API schema cache."
    )
  }

  return new Error(message)
}

function normalizeVMVUpdate(data: BusinessVMVUpdate): BusinessVMVUpdate {
  return {
    ...(data.vision !== undefined ? { vision: data.vision?.trim() || null } : {}),
    ...(data.mission !== undefined
      ? { mission: data.mission?.trim() || null }
      : {}),
    ...(data.values !== undefined ? { values: data.values?.trim() || null } : {}),
  }
}

export async function getVMV(businessId: string): Promise<BusinessVMV | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("business_vmv")
    .select("*")
    .eq("business_id", businessId)
    .maybeSingle()

  if (error) {
    throw formatVMVError(error.message)
  }

  return data satisfies BusinessVMV | null
}

export async function upsertVMV(
  businessId: string,
  data: BusinessVMVUpdate
): Promise<BusinessVMV> {
  const supabase = await createClient()
  const { data: vmv, error } = await supabase
    .from("business_vmv")
    .upsert(
      {
        business_id: businessId,
        ...normalizeVMVUpdate(data),
      },
      {
        onConflict: "business_id",
      }
    )
    .select("*")
    .single()

  if (error) {
    throw formatVMVError(error.message)
  }

  return vmv satisfies BusinessVMV
}

export async function getVMVHistory(
  businessId: string
): Promise<BusinessVMVHistory[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("business_vmv_history")
    .select("*")
    .eq("business_id", businessId)
    .order("version", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    throw formatVMVError(error.message)
  }

  return data satisfies BusinessVMVHistory[]
}

export async function getVMVVersion(
  businessId: string,
  version: number
): Promise<BusinessVMVHistory | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("business_vmv_history")
    .select("*")
    .eq("business_id", businessId)
    .eq("version", version)
    .maybeSingle()

  if (error) {
    throw formatVMVError(error.message)
  }

  return data satisfies BusinessVMVHistory | null
}
