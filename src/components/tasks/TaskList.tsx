"use client"

import { CalendarClockIcon, CheckIcon } from "lucide-react"

import type { TaskCache } from "@/types/database"
import { getImportanceDotClass, isTaskDueToday, isTaskOverdue } from "@/lib/tasks"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type TaskListProps = {
  tasks: TaskCache[]
  completingIds: Record<string, boolean>
  onComplete: (id: string) => Promise<void>
}

function formatDueDate(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
  }).format(new Date(`${value}T00:00:00`))
}

export function TaskList({ tasks, completingIds, onComplete }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <section className="rounded-[24px] border border-dashed border-border/70 bg-muted/20 px-6 py-12 text-center shadow-sm">
        <h2 className="text-2xl font-semibold tracking-tight">No incomplete tasks</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
          Run a sync to pull the latest list from Microsoft To Do.
        </p>
      </section>
    )
  }

  return (
    <section className="space-y-3">
      {tasks.map((task) => {
        const overdue = isTaskOverdue(task)
        const dueToday = isTaskDueToday(task)

        return (
          <article
            key={task.id}
            className="flex flex-col gap-4 rounded-[24px] border border-border/70 bg-card/90 px-4 py-4 shadow-sm md:flex-row md:items-center md:justify-between"
          >
            <div className="flex min-w-0 items-start gap-3">
              <span
                className={`mt-2 size-2.5 shrink-0 rounded-full ${getImportanceDotClass(task.importance)}`}
              />
              <div className="min-w-0 space-y-2">
                <p className="truncate text-base font-medium text-foreground">
                  {task.title}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {task.importance}
                  </Badge>
                  {task.due_date ? (
                    <Badge
                      variant={overdue ? "destructive" : "secondary"}
                      className={dueToday && !overdue ? "bg-amber-500/15 text-amber-700 dark:text-amber-300" : undefined}
                    >
                      <CalendarClockIcon />
                      {overdue ? "Overdue" : dueToday ? "Due today" : formatDueDate(task.due_date)}
                    </Badge>
                  ) : null}
                </div>
                {task.body_preview ? (
                  <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                    {task.body_preview}
                  </p>
                ) : null}
              </div>
            </div>

            <Button
              variant="outline"
              disabled={Boolean(completingIds[task.id])}
              onClick={() => void onComplete(task.id)}
            >
              <CheckIcon />
              {completingIds[task.id] ? "Completing..." : "Complete"}
            </Button>
          </article>
        )
      })}
    </section>
  )
}
