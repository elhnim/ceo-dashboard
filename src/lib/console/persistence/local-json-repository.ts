/**
 * Founder Console — local JSON persistence adapter.
 *
 * Implements ConsoleRepository against a single JSON file. On first use it
 * writes the founding seed. Transactions are serialized through an in-process
 * promise chain so concurrent dev-server requests can't race on the file.
 * Suitable for local single-user development; production would swap in a real
 * database behind the same interface.
 *
 * Data directory resolution:
 *  - `FOUNDER_CONSOLE_DATA_DIR` env var wins if set.
 *  - On serverless platforms (Netlify / Vercel / AWS Lambda) the project
 *    filesystem is read-only, so we fall back to the OS temp dir. Persistence
 *    there is ephemeral per instance — acceptable for a demo; see deploy notes.
 *  - Otherwise `.data/` under the project root (local development).
 */

import { mkdir, readFile, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"

import { createSeedState } from "./seed"
import { migrateState } from "./migrate"
import type { ConsoleRepository } from "./repository"
import type { ConsoleState } from "@/types/console"

function resolveDataDir(): string {
  if (process.env.FOUNDER_CONSOLE_DATA_DIR) {
    return process.env.FOUNDER_CONSOLE_DATA_DIR
  }
  if (
    process.env.NETLIFY ||
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME
  ) {
    return path.join(os.tmpdir(), "founder-console")
  }
  return path.join(process.cwd(), ".data")
}

const DATA_DIR = resolveDataDir()
const DATA_FILE = path.join(DATA_DIR, "founder-console.json")

function clone<T>(value: T): T {
  return structuredClone(value)
}

export class LocalJsonRepository implements ConsoleRepository {
  private queue: Promise<unknown> = Promise.resolve()

  async load(): Promise<ConsoleState> {
    try {
      const raw = await readFile(DATA_FILE, "utf8")
      // Fill any fields introduced after this file was written (idempotent).
      return migrateState(JSON.parse(raw))
    } catch {
      const seed = createSeedState()
      await this.save(seed)
      return seed
    }
  }

  async save(state: ConsoleState): Promise<void> {
    await mkdir(DATA_DIR, { recursive: true })
    await writeFile(DATA_FILE, JSON.stringify(state, null, 2), "utf8")
  }

  transaction<T>(
    fn: (state: ConsoleState) => { state: ConsoleState; result: T },
  ): Promise<T> {
    const run = this.queue.then(async () => {
      const current = await this.load()
      const { state, result } = fn(clone(current))
      await this.save(state)
      return result
    })
    // Keep the chain alive even if a transaction rejects.
    this.queue = run.then(
      () => undefined,
      () => undefined,
    )
    return run
  }
}

let repository: ConsoleRepository | null = null

/** The active repository singleton (local JSON adapter for the MVP). */
export function getRepository(): ConsoleRepository {
  if (!repository) repository = new LocalJsonRepository()
  return repository
}
