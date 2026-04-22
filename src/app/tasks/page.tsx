import { TasksClient } from "@/components/tasks/TasksClient"
import { requireAuth } from "@/lib/auth"
import { getIncompleteTasks } from "@/lib/services/tasks"
import type { TaskCache } from "@/types/database"

export default async function TasksPage() {
  await requireAuth()

  let initialError: string | null = null
  let initialTasks: TaskCache[] = []

  try {
    initialTasks = await getIncompleteTasks()
  } catch (error) {
    initialError = error instanceof Error ? error.message : "Unable to load tasks"
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8">
      <section className="rounded-[28px] border border-border/70 bg-gradient-to-br from-card via-card to-muted/60 p-6 shadow-sm md:p-8">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground">
          Execution system
        </p>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Tasks
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              Pull from Microsoft To Do, keep the next action obvious, and move
              work into the right quadrant before it becomes noise.
            </p>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            List view keeps the order crisp. Matrix view helps decide what to do
            now, what to schedule, and what should not stay on your plate.
          </p>
        </div>
      </section>

      <TasksClient initialTasks={initialTasks} initialError={initialError} />
    </div>
  )
}
