import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"

import { MicrosoftToDoProvider } from "./tasks-todo"

export async function syncTasks(accessToken: string): Promise<number> {
  const supabase = createAdminClient()
  const tasks = await new MicrosoftToDoProvider(accessToken).getTasks()
  const syncedAt = new Date().toISOString()

  if (tasks.length === 0) {
    const { error: clearError } = await supabase.from("tasks_cache").delete().neq("id", "")

    if (clearError) {
      throw new Error(clearError.message)
    }

    return 0
  }

  const taskIds = tasks.map((task) => `"${task.externalId}"`).join(",")
  const { error: cleanupError } = await supabase
    .from("tasks_cache")
    .delete()
    .not("external_id", "in", `(${taskIds})`)

  if (cleanupError) {
    throw new Error(cleanupError.message)
  }

  const { error } = await supabase.from("tasks_cache").upsert(
    tasks.map((task) => ({
      external_id: task.externalId,
      title: task.title,
      due_date: task.dueDate,
      importance: task.importance,
      status: task.status,
      synced_at: syncedAt,
    })),
    { onConflict: "external_id" }
  )

  if (error) {
    throw new Error(error.message)
  }

  return tasks.length
}
