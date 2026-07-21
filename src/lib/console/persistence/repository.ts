/**
 * Founder Console — persistence port.
 *
 * The repository is a thin persistence boundary: it loads and saves the whole
 * ConsoleState and runs serialized read-modify-write transactions. It knows
 * nothing about domain semantics — that lives in the service layer. Swapping
 * the local JSON adapter for SQLite/Postgres/Supabase means implementing this
 * one interface (see docs/adr/0002-persistence-and-integrations.md).
 */

import type { ConsoleState } from "@/types/console"

export interface ConsoleRepository {
  /** Load the full state, seeding on first use. */
  load(): Promise<ConsoleState>
  /** Overwrite the full state. */
  save(state: ConsoleState): Promise<void>
  /**
   * Serialized read-modify-write. The callback receives a deep copy of the
   * current state and returns the next state plus a result value.
   */
  transaction<T>(
    fn: (state: ConsoleState) => { state: ConsoleState; result: T },
  ): Promise<T>
}
