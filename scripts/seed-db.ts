import { readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { createClient } from "@supabase/supabase-js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const requiredTables = [
  "businesses",
  "business_vmv",
  "business_vmv_history",
  "objectives",
  "key_results",
  "daily_priorities",
] as const

function getRequiredEnv(
  name:
    | "NEXT_PUBLIC_SUPABASE_URL"
    | "SUPABASE_SERVICE_ROLE_KEY"
    | "SUPABASE_PG_META_URL",
) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

function createAdminClient() {
  return createClient(
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
  )
}

function getPgMetaUrl() {
  return process.env.SUPABASE_PG_META_URL ?? null
}

async function applySchemaWithPgMeta(query: string) {
  const response = await fetch(`${getRequiredEnv("SUPABASE_PG_META_URL")}/query`, {
    method: "POST",
    headers: {
      apikey: getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
      Authorization: `Bearer ${getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Supabase query failed (${response.status}): ${errorText}`)
  }
}

async function verifyTables() {
  const supabase = createAdminClient()
  const results = await Promise.all(
    requiredTables.map(async (tableName) => {
      const { error } = await supabase
        .from(tableName)
        .select("*", { head: true, count: "exact" })

      return {
        tableName,
        ok: !error,
        message: error?.message ?? "ok",
      }
    }),
  )

  const missingTables = results.filter((result) => !result.ok)

  if (missingTables.length > 0) {
    const detail = missingTables
      .map((result) => `${result.tableName}: ${result.message}`)
      .join("; ")
    throw new Error(
      `Expected schema tables are missing. Provide SUPABASE_PG_META_URL to auto-apply the SQL, or run docs/architecture/database-schema.sql manually in Supabase SQL Editor. ${detail}`,
    )
  }

  return results
}

async function main() {
  const schemaPath = path.resolve(
    __dirname,
    "..",
    "docs",
    "architecture",
    "database-schema.sql",
  )
  const schemaSql = await readFile(schemaPath, "utf8")

  if (getPgMetaUrl()) {
    await applySchemaWithPgMeta(schemaSql)
    console.log("Schema SQL applied through pg_meta.")
  } else {
    console.log(
      "SUPABASE_PG_META_URL is not configured. Skipping SQL apply and verifying the required tables instead.",
    )
  }

  const verification = await verifyTables()
  console.log("Supabase schema verified.")
  console.log(JSON.stringify(verification, null, 2))
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(message)
  process.exitCode = 1
})
