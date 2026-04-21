import { createAdminClient } from "@/lib/supabase/admin"
import { getTasksSchemaSql } from "@/lib/services/tasks-schema"

function getRequiredEnv(name: "SUPABASE_PG_META_URL") {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

async function runSql(query: string) {
  const response = await fetch(`${getRequiredEnv("SUPABASE_PG_META_URL")}/query`, {
    method: "POST",
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY || ""}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Supabase query failed (${response.status}): ${errorText}`)
  }
}

async function verifyTable() {
  const supabase = createAdminClient()
  const { error } = await supabase.from("tasks_cache").select("id").limit(1)

  if (error) {
    throw new Error(`tasks_cache verification failed: ${error.message}`)
  }
}

async function main() {
  await runSql(getTasksSchemaSql())
  await verifyTable()
  console.log("Tasks schema migration completed successfully.")
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(message)
  process.exitCode = 1
})
