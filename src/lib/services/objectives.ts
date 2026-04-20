import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { Objective } from "@/types/database"

export class ObjectiveSchemaError extends Error {
  constructor(
    message = "Supabase can’t read the objectives tables for the dashboard yet."
  ) {
    super(message)
    this.name = "ObjectiveSchemaError"
  }
}

function formatObjectiveError(message: string) {
  if (message.includes("schema cache")) {
    return new ObjectiveSchemaError(
      "Supabase can’t read the OKR tables yet. Re-run the database schema in Supabase SQL Editor or refresh the project API schema cache."
    )
  }

  return new Error(message)
}

export async function getActiveObjectives(): Promise<Objective[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("objectives")
    .select("*")
    .eq("status", "active")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true })

  if (error) {
    throw formatObjectiveError(error.message)
  }

  return data satisfies Objective[]
}
