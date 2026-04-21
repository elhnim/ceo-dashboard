"use client"

import {
  DndContext,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { CheckIcon, GripVerticalIcon } from "lucide-react"

import type { TaskCache, TaskQuadrant } from "@/types/database"
import {
  getTaskQuadrant,
  getTaskQuadrantLabel,
  taskQuadrants,
} from "@/lib/tasks"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type EisenhowerMatrixProps = {
  tasks: TaskCache[]
  movingIds: Record<string, boolean>
  completingIds: Record<string, boolean>
  onMoveTask: (id: string, quadrant: TaskQuadrant) => Promise<void>
  onComplete: (id: string) => Promise<void>
}

type MatrixColumnProps = {
  quadrant: TaskQuadrant
  tasks: TaskCache[]
  movingIds: Record<string, boolean>
  completingIds: Record<string, boolean>
  onComplete: (id: string) => Promise<void>
}

function MatrixColumn({
  quadrant,
  tasks,
  movingIds,
  completingIds,
  onComplete,
}: MatrixColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `quadrant-${quadrant}`,
    data: { quadrant },
  })

  return (
    <section
      ref={setNodeRef}
      className={`rounded-[28px] border px-4 py-4 shadow-sm transition-colors ${
        isOver ? "border-primary/40 bg-primary/5" : "border-border/70 bg-card/80"
      }`}
    >
      <div className="mb-4 space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">
          {getTaskQuadrantLabel(quadrant)}
        </h2>
        <p className="text-sm text-muted-foreground">
          {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
        </p>
      </div>

      <SortableContext
        items={tasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {tasks.map((task) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              quadrant={quadrant}
              isMoving={Boolean(movingIds[task.id])}
              isCompleting={Boolean(completingIds[task.id])}
              onComplete={onComplete}
            />
          ))}
          {tasks.length === 0 ? (
            <div className="rounded-[20px] border border-dashed border-border/70 bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
              Drop tasks here
            </div>
          ) : null}
        </div>
      </SortableContext>
    </section>
  )
}

function SortableTaskCard({
  task,
  quadrant,
  isMoving,
  isCompleting,
  onComplete,
}: {
  task: TaskCache
  quadrant: TaskQuadrant
  isMoving: boolean
  isCompleting: boolean
  onComplete: (id: string) => Promise<void>
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { quadrant },
  })

  return (
    <article
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`rounded-[20px] border border-border/70 bg-background/90 p-3 shadow-sm ${
        isDragging ? "opacity-70" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          className="mt-0.5 rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVerticalIcon className="size-4" />
        </button>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">{task.title}</p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {task.importance}
              </Badge>
              {task.due_date ? (
                <Badge variant="secondary">{task.due_date}</Badge>
              ) : null}
              {isMoving ? <Badge variant="ghost">Saving...</Badge> : null}
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            disabled={isCompleting}
            onClick={() => void onComplete(task.id)}
          >
            <CheckIcon />
            {isCompleting ? "Completing..." : "Complete"}
          </Button>
        </div>
      </div>
    </article>
  )
}

export function EisenhowerMatrix({
  tasks,
  movingIds,
  completingIds,
  onMoveTask,
  onComplete,
}: EisenhowerMatrixProps) {
  const sensors = useSensors(useSensor(PointerSensor))
  const tasksByQuadrant = taskQuadrants.reduce<Record<TaskQuadrant, TaskCache[]>>(
    (accumulator, quadrant) => {
      accumulator[quadrant] = tasks.filter(
        (task) => getTaskQuadrant(task) === quadrant,
      )
      return accumulator
    },
    {
      do: [],
      schedule: [],
      delegate: [],
      eliminate: [],
    },
  )

  function getTargetQuadrant(event: DragEndEvent): TaskQuadrant | null {
    const overData = event.over?.data.current

    if (
      overData?.quadrant === "do" ||
      overData?.quadrant === "schedule" ||
      overData?.quadrant === "delegate" ||
      overData?.quadrant === "eliminate"
    ) {
      return overData.quadrant
    }

    return null
  }

  function handleDragEnd(event: DragEndEvent) {
    if (!event.over) {
      return
    }

    const targetQuadrant = getTargetQuadrant(event)

    if (!targetQuadrant) {
      return
    }

    const activeTask = tasks.find((task) => task.id === String(event.active.id))

    if (!activeTask || getTaskQuadrant(activeTask) === targetQuadrant) {
      return
    }

    void onMoveTask(activeTask.id, targetQuadrant)
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <section className="grid gap-4 lg:grid-cols-2">
        {taskQuadrants.map((quadrant) => (
          <MatrixColumn
            key={quadrant}
            quadrant={quadrant}
            tasks={tasksByQuadrant[quadrant]}
            movingIds={movingIds}
            completingIds={completingIds}
            onComplete={onComplete}
          />
        ))}
      </section>
    </DndContext>
  )
}
