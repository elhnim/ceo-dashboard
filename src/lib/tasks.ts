import type {
  TaskCache,
  TaskImportance,
} from "@/types/database"

type TaskQuadrant = "do" | "schedule" | "delegate" | "eliminate"

const importanceRank: Record<TaskImportance, number> = {
  high: 0,
  normal: 1,
  low: 2,
}

export const taskQuadrants: TaskQuadrant[] = [
  "do",
  "schedule",
  "delegate",
  "eliminate",
]

export function getTodayDateString() {
  return new Date().toISOString().split("T")[0]
}

export function sortTasks(tasks: TaskCache[]): TaskCache[] {
  return [...tasks].sort((left, right) => {
    const importanceDifference =
      importanceRank[left.importance] - importanceRank[right.importance]

    if (importanceDifference !== 0) {
      return importanceDifference
    }

    if (left.due_date && right.due_date) {
      return left.due_date.localeCompare(right.due_date)
    }

    if (left.due_date) {
      return -1
    }

    if (right.due_date) {
      return 1
    }

    return left.title.localeCompare(right.title)
  })
}

export function isTaskOverdue(task: Pick<TaskCache, "due_date" | "status">) {
  if (!task.due_date || task.status === "completed") {
    return false
  }

  return task.due_date < getTodayDateString()
}

export function isTaskDueToday(task: Pick<TaskCache, "due_date">) {
  return task.due_date === getTodayDateString()
}

export function getDoThisNextReason(task: TaskCache) {
  if (isTaskOverdue(task)) {
    return `Overdue since ${task.due_date}`
  }

  if (isTaskDueToday(task)) {
    return "Due today"
  }

  if (task.importance === "high") {
    return "High priority"
  }

  return "Next up"
}

export function getDoThisNextRank(task: TaskCache) {
  const today = getTodayDateString()

  if (task.due_date && task.due_date < today && task.importance === "high") {
    return 0
  }

  if (task.due_date === today && task.importance === "high") {
    return 1
  }

  if (task.due_date === today && task.importance === "normal") {
    return 2
  }

  if (!task.due_date && task.importance === "high") {
    return 3
  }

  if (!task.due_date && task.importance === "normal") {
    return 4
  }

  if (task.due_date && task.due_date < today) {
    return 5
  }

  if (task.due_date) {
    return 6
  }

  return 7
}

export function getDefaultQuadrant(task: Pick<TaskCache, "importance" | "due_date">) {
  const urgent = Boolean(task.due_date)
  const important = task.importance === "high"

  if (urgent && important) {
    return "do"
  }

  if (!urgent && important) {
    return "schedule"
  }

  if (urgent) {
    return "delegate"
  }

  return "eliminate"
}

export function getTaskQuadrant(task: TaskCache) {
  return task.quadrant ?? getDefaultQuadrant(task)
}

export function getTaskQuadrantLabel(quadrant: TaskQuadrant) {
  if (quadrant === "do") {
    return "Urgent + Important"
  }

  if (quadrant === "schedule") {
    return "Not urgent + Important"
  }

  if (quadrant === "delegate") {
    return "Urgent + Not important"
  }

  return "Not urgent + Not important"
}

export function getImportanceDotClass(importance: TaskImportance) {
  if (importance === "high") {
    return "bg-destructive"
  }

  if (importance === "normal") {
    return "bg-amber-500"
  }

  return "bg-muted-foreground/50"
}
