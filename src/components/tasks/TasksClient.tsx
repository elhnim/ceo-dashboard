"use client"

import { LayoutGridIcon, ListTodoIcon, RefreshCcwIcon } from "lucide-react"

import type { TaskCache } from "@/types/database"
import { isTaskOverdue } from "@/lib/tasks"
import { useTasks } from "@/hooks/use-tasks"
import { EisenhowerMatrix } from "@/components/tasks/EisenhowerMatrix"
import { TaskList } from "@/components/tasks/TaskList"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type TasksClientProps = {
  initialTasks: TaskCache[]
  initialError: string | null
}

export function TasksClient({ initialTasks, initialError }: TasksClientProps) {
  const {
    tasks,
    error,
    isLoading,
    isSyncing,
    completingIds,
    movingIds,
    sync,
    complete,
    moveTask,
  } = useTasks({
    initialTasks,
    initialError,
  })

  const overdueCount = tasks.filter((task) => isTaskOverdue(task)).length
  const highPriorityCount = tasks.filter((task) => task.importance === "high").length

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-border/70 bg-card/80 px-4 py-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{tasks.length} open</Badge>
          <Badge variant="outline">{highPriorityCount} high priority</Badge>
          <Badge variant={overdueCount > 0 ? "destructive" : "secondary"}>
            {overdueCount} overdue
          </Badge>
        </div>

        <Button variant="ghost" disabled={isSyncing} onClick={() => void sync()}>
          <RefreshCcwIcon className={isSyncing ? "animate-spin" : undefined} />
          {isSyncing ? "Syncing..." : "Sync"}
        </Button>
      </section>

      {error ? (
        <section className="rounded-[24px] border border-destructive/30 bg-destructive/5 px-5 py-4 text-sm text-destructive shadow-sm">
          {error}
        </section>
      ) : null}

      {isLoading && tasks.length === 0 ? (
        <section className="rounded-[24px] border border-dashed border-border/70 bg-muted/20 px-6 py-12 text-center text-sm text-muted-foreground shadow-sm">
          Loading tasks...
        </section>
      ) : (
        <Tabs defaultValue="list" className="gap-5">
          <TabsList>
            <TabsTrigger value="list">
              <ListTodoIcon />
              List view
            </TabsTrigger>
            <TabsTrigger value="matrix">
              <LayoutGridIcon />
              Eisenhower Matrix
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <TaskList
              tasks={tasks}
              completingIds={completingIds}
              onComplete={complete}
            />
          </TabsContent>

          <TabsContent value="matrix">
            <EisenhowerMatrix
              tasks={tasks}
              movingIds={movingIds}
              completingIds={completingIds}
              onMoveTask={moveTask}
              onComplete={complete}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
