import "server-only"

import type { TaskCache } from "@/types/database"
import { getDoThisNextRank, getDoThisNextReason, sortTasks } from "@/lib/tasks"
import { createClient } from "@/lib/supabase/server"
import { ensureTasksSchema } from "@/lib/services/tasks-schema"

export async function getDoThisNext(): Promise<{ title: string; reason: string } | null> {
  await ensureTasksSchema()

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("tasks_cache")
    .select("*")
    .neq("status", "completed")

  if (error) {
    throw new Error(error.message)
  }

  const tasks = data satisfies TaskCache[]

  const [task] = [...tasks].sort((left, right) => {
    const rankDifference = getDoThisNextRank(left) - getDoThisNextRank(right)

    if (rankDifference !== 0) {
      return rankDifference
    }

    const [first] = sortTasks([left, right])
    return first.id === left.id ? -1 : 1
  })

  if (!task) {
    return null
  }

  return {
    title: task.title,
    reason: getDoThisNextReason(task),
  }
}
