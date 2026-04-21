import "server-only"

import type { TaskCache } from "@/types/database"
import { sortTasks } from "@/lib/tasks"
import { createClient } from "@/lib/supabase/server"
import { ensureTasksSchema, TaskSchemaError } from "@/lib/services/tasks-schema"

type TaskQuadrant = "do" | "schedule" | "delegate" | "eliminate"

function formatTaskError(message: string) {
  if (message.includes("schema cache") || message.includes("tasks_cache")) {
    return new TaskSchemaError(
      "Supabase can’t read the tasks cache yet. Create the tasks_cache table, then try again.",
    )
  }

  return new Error(message)
}

export async function getIncompleteTasks(): Promise<TaskCache[]> {
  await ensureTasksSchema()

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("tasks_cache")
    .select("*")
    .neq("status", "completed")

  if (error) {
    throw formatTaskError(error.message)
  }

  return sortTasks(data satisfies TaskCache[])
}

export async function getTaskCacheById(id: string): Promise<TaskCache> {
  await ensureTasksSchema()

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("tasks_cache")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    throw formatTaskError(error.message)
  }

  if (!data) {
    throw new Error("Task not found")
  }

  return data satisfies TaskCache
}

export async function updateTaskQuadrant(
  id: string,
  quadrant: TaskQuadrant,
): Promise<TaskCache> {
  await ensureTasksSchema()

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("tasks_cache")
    .update({ quadrant })
    .eq("id", id)
    .select("*")
    .single()

  if (error) {
    throw formatTaskError(error.message)
  }

  if (!data) {
    throw new Error("Unable to update task quadrant")
  }

  return data satisfies TaskCache
}
