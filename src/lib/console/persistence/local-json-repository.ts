/**
 * Founder Console — local JSON persistence adapter.
 *
 * Implements ConsoleRepository against a single JSON file under `.data/`. On
 * first use it writes the founding seed. Transactions are serialized through
 * an in-process promise chain so concurrent dev-server requests can't race on
 * the file. Suitable for local single-user development; production would swap
 * in a real database behind the same interface.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

import { createSeedState } from "./seed"
import type { ConsoleRepository } from "./repository"
import type { ConsoleState } from "@/types/console"

const DATA_DIR = path.join(process.cwd(), ".data")
const DATA_FILE = path.join(DATA_DIR, "founder-console.json")

function clone<T>(value: T): T {
  return structuredClone(value)
}

export class LocalJsonRepository implements ConsoleRepository {
  private queue: Promise<unknown> = Promise.resolve()

  async load(): Promise<ConsoleState> {
    try {
      const raw = await readFile(DATA_FILE, "utf8")
      return JSON.parse(raw) as ConsoleState
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
