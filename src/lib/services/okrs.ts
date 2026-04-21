import "server-only"

import { createServerClient } from "@/lib/supabase/server"
import type {
  KeyResult,
  KeyResultInsert,
  KeyResultUpdate,
  Objective,
  ObjectiveInsert,
  ObjectiveWithBusiness,
} from "@/types/okr"

type ObjectiveWithKeyResultsRow = Objective & {
  key_results: KeyResult[] | null
}

type ObjectiveWithBusinessRow = Objective & {
  business: {
    name: string
  } | {
    name: string
  }[] | null
}

export class OKRSchemaError extends Error {
  constructor(
    message = "Supabase can’t read the OKR tables for the dashboard yet."
  ) {
    super(message)
    this.name = "OKRSchemaError"
  }
}

function formatOKRError(message: string) {
  if (message.includes("schema cache")) {
    return new OKRSchemaError(
      "Supabase can’t read the OKR tables yet. Re-run the database schema in Supabase SQL Editor or refresh the project API schema cache."
    )
  }

  return new Error(message)
}

function toNumber(value: number | string | null | undefined) {
  return Number(value ?? 0)
}

function normalizeKeyResult(keyResult: KeyResult): KeyResult {
  return {
    ...keyResult,
    target_value: toNumber(keyResult.target_value),
    current_value: toNumber(keyResult.current_value),
  }
}

function normalizeObjective(objective: ObjectiveWithKeyResultsRow): Objective {
  return {
    ...objective,
    progress: toNumber(objective.progress),
    key_results: (objective.key_results ?? []).map(normalizeKeyResult),
  }
}

function normalizeActiveObjective(
  objective: ObjectiveWithBusinessRow
): ObjectiveWithBusiness {
  const business = Array.isArray(objective.business)
    ? objective.business[0] ?? null
    : objective.business

  return {
    ...objective,
    progress: toNumber(objective.progress),
    business,
  }
}

function normalizeObjectiveInsert(
  data: ObjectiveInsert,
  displayOrder: number
): ObjectiveInsert {
  return {
    business_id: data.business_id,
    title: data.title.trim(),
    description: data.description?.trim() || undefined,
    status: data.status ?? "draft",
    cadence: data.cadence ?? "quarterly",
    start_date: data.start_date || undefined,
    end_date: data.end_date || undefined,
    display_order: data.display_order ?? displayOrder,
  }
}

function normalizeObjectiveUpdate(data: Partial<ObjectiveInsert>) {
  return {
    ...(data.title !== undefined ? { title: data.title.trim() } : {}),
    ...(data.description !== undefined
      ? { description: data.description?.trim() || null }
      : {}),
    ...(data.status !== undefined ? { status: data.status } : {}),
    ...(data.cadence !== undefined ? { cadence: data.cadence } : {}),
    ...(data.start_date !== undefined
      ? { start_date: data.start_date || null }
      : {}),
    ...(data.end_date !== undefined ? { end_date: data.end_date || null } : {}),
    ...(data.display_order !== undefined
      ? { display_order: data.display_order }
      : {}),
  }
}

function normalizeKeyResultInsert(
  data: KeyResultInsert,
  displayOrder: number
): KeyResultInsert {
  return {
    objective_id: data.objective_id,
    title: data.title.trim(),
    description: data.description?.trim() || undefined,
    target_value: data.target_value,
    current_value: data.current_value ?? 0,
    unit: data.unit?.trim() || "%",
    display_order: data.display_order ?? displayOrder,
  }
}

function normalizeKeyResultUpdate(data: KeyResultUpdate): KeyResultUpdate {
  return {
    ...(data.title !== undefined ? { title: data.title.trim() } : {}),
    ...(data.description !== undefined
      ? { description: data.description?.trim() || null }
      : {}),
    ...(data.target_value !== undefined
      ? { target_value: data.target_value }
      : {}),
    ...(data.current_value !== undefined
      ? { current_value: data.current_value }
      : {}),
    ...(data.unit !== undefined ? { unit: data.unit.trim() || "%" } : {}),
    ...(data.display_order !== undefined
      ? { display_order: data.display_order }
      : {}),
  }
}

async function assertObjectiveExists(id: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("objectives")
    .select("id")
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw formatOKRError(error.message)
  }

  if (!data) {
    throw new Error("Objective not found")
  }
}

async function assertKeyResultExists(id: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("key_results")
    .select("id")
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw formatOKRError(error.message)
  }

  if (!data) {
    throw new Error("Key result not found")
  }
}

async function getObjectiveDisplayOrder(businessId: string) {
  const supabase = await createServerClient()
  const { count, error } = await supabase
    .from("objectives")
    .select("id", { count: "exact", head: true })
    .eq("business_id", businessId)

  if (error) {
    throw formatOKRError(error.message)
  }

  return count ?? 0
}

async function getKeyResultDisplayOrder(objectiveId: string) {
  const supabase = await createServerClient()
  const { count, error } = await supabase
    .from("key_results")
    .select("id", { count: "exact", head: true })
    .eq("objective_id", objectiveId)

  if (error) {
    throw formatOKRError(error.message)
  }

  return count ?? 0
}

export async function getObjectives(businessId: string): Promise<Objective[]> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("objectives")
    .select(
      "id,business_id,title,description,status,cadence,start_date,end_date,progress,display_order,created_at,updated_at,key_results(id,objective_id,title,description,target_value,current_value,unit,display_order,created_at,updated_at)"
    )
    .eq("business_id", businessId)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true })
    .order("display_order", {
      ascending: true,
      referencedTable: "key_results",
    })
    .order("created_at", { ascending: true, referencedTable: "key_results" })

  if (error) {
    throw formatOKRError(error.message)
  }

  return (data ?? []).map((objective) =>
    normalizeObjective(objective as ObjectiveWithKeyResultsRow)
  )
}

export async function getObjective(id: string): Promise<Objective> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("objectives")
    .select(
      "id,business_id,title,description,status,cadence,start_date,end_date,progress,display_order,created_at,updated_at,key_results(id,objective_id,title,description,target_value,current_value,unit,display_order,created_at,updated_at)"
    )
    .eq("id", id)
    .order("display_order", {
      ascending: true,
      referencedTable: "key_results",
    })
    .order("created_at", { ascending: true, referencedTable: "key_results" })
    .maybeSingle()

  if (error) {
    throw formatOKRError(error.message)
  }

  if (!data) {
    throw new Error("Objective not found")
  }

  return normalizeObjective(data as ObjectiveWithKeyResultsRow)
}

export async function createObjective(data: ObjectiveInsert): Promise<Objective> {
  const supabase = await createServerClient()
  const displayOrder = await getObjectiveDisplayOrder(data.business_id)
  const payload = normalizeObjectiveInsert(data, displayOrder)

  const { data: createdObjective, error } = await supabase
    .from("objectives")
    .insert(payload)
    .select(
      "id,business_id,title,description,status,cadence,start_date,end_date,progress,display_order,created_at,updated_at"
    )
    .single()

  if (error) {
    throw formatOKRError(error.message)
  }

  if (!createdObjective) {
    throw new Error("Unable to create objective")
  }

  return {
    ...(createdObjective as Objective),
    progress: toNumber(createdObjective.progress),
    key_results: [],
  }
}

export async function updateObjective(
  id: string,
  data: Partial<ObjectiveInsert>
): Promise<Objective> {
  await assertObjectiveExists(id)
  const supabase = await createServerClient()
  const payload = normalizeObjectiveUpdate(data)

  const { data: updatedObjective, error } = await supabase
    .from("objectives")
    .update(payload)
    .eq("id", id)
    .select(
      "id,business_id,title,description,status,cadence,start_date,end_date,progress,display_order,created_at,updated_at,key_results(id,objective_id,title,description,target_value,current_value,unit,display_order,created_at,updated_at)"
    )
    .order("display_order", {
      ascending: true,
      referencedTable: "key_results",
    })
    .order("created_at", { ascending: true, referencedTable: "key_results" })
    .single()

  if (error) {
    throw formatOKRError(error.message)
  }

  if (!updatedObjective) {
    throw new Error("Unable to update objective")
  }

  return normalizeObjective(updatedObjective as ObjectiveWithKeyResultsRow)
}

export async function deleteObjective(id: string): Promise<void> {
  await assertObjectiveExists(id)
  const supabase = await createServerClient()
  const { error } = await supabase.from("objectives").delete().eq("id", id)

  if (error) {
    throw formatOKRError(error.message)
  }
}

export async function createKeyResult(
  data: KeyResultInsert
): Promise<KeyResult> {
  const supabase = await createServerClient()
  const displayOrder = await getKeyResultDisplayOrder(data.objective_id)
  const payload = normalizeKeyResultInsert(data, displayOrder)

  const { data: createdKeyResult, error } = await supabase
    .from("key_results")
    .insert(payload)
    .select(
      "id,objective_id,title,description,target_value,current_value,unit,display_order,created_at,updated_at"
    )
    .single()

  if (error) {
    throw formatOKRError(error.message)
  }

  if (!createdKeyResult) {
    throw new Error("Unable to create key result")
  }

  return normalizeKeyResult(createdKeyResult as KeyResult)
}

export async function updateKeyResult(
  id: string,
  data: KeyResultUpdate
): Promise<KeyResult> {
  await assertKeyResultExists(id)
  const supabase = await createServerClient()
  const payload = normalizeKeyResultUpdate(data)

  const { data: updatedKeyResult, error } = await supabase
    .from("key_results")
    .update(payload)
    .eq("id", id)
    .select(
      "id,objective_id,title,description,target_value,current_value,unit,display_order,created_at,updated_at"
    )
    .single()

  if (error) {
    throw formatOKRError(error.message)
  }

  if (!updatedKeyResult) {
    throw new Error("Unable to update key result")
  }

  return normalizeKeyResult(updatedKeyResult as KeyResult)
}

export async function deleteKeyResult(id: string): Promise<void> {
  await assertKeyResultExists(id)
  const supabase = await createServerClient()
  const { error } = await supabase.from("key_results").delete().eq("id", id)

  if (error) {
    throw formatOKRError(error.message)
  }
}

export async function getActiveOKRs(): Promise<ObjectiveWithBusiness[]> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("objectives")
    .select(
      "id,business_id,title,description,status,cadence,start_date,end_date,progress,display_order,created_at,updated_at,business:businesses(name)"
    )
    .eq("status", "active")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true })

  if (error) {
    throw formatOKRError(error.message)
  }

  return (data ?? []).map((objective) =>
    normalizeActiveObjective(objective as ObjectiveWithBusinessRow)
  )
}
