"use client"

import { useEffect, useState, useTransition } from "react"

import type { TaskCache, TaskQuadrant } from "@/types/database"
import { sortTasks } from "@/lib/tasks"

type UseTasksOptions = {
  initialTasks?: TaskCache[]
  initialError?: string | null
}

type TaskActionState = {
  syncing: boolean
  completingIds: Record<string, boolean>
  movingIds: Record<string, boolean>
}

async function readJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T
}

async function fetchTasksRequest() {
  const response = await fetch("/api/tasks", {
    cache: "no-store",
  })
  const result = await readJson<{ tasks?: TaskCache[]; error?: string }>(response)

  if (!response.ok) {
    throw new Error(result.error || "Unable to load tasks")
  }

  return sortTasks(result.tasks || [])
}

async function syncTasksRequest() {
  const response = await fetch("/api/tasks/sync", {
    method: "POST",
  })
  const result = await readJson<{ tasks?: TaskCache[]; error?: string }>(response)

  if (!response.ok) {
    throw new Error(result.error || "Unable to sync tasks")
  }

  return sortTasks(result.tasks || [])
}

async function completeTaskRequest(id: string) {
  const response = await fetch(`/api/tasks/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action: "complete" }),
  })
  const result = await readJson<{ ok?: boolean; error?: string }>(response)

  if (!response.ok || !result.ok) {
    throw new Error(result.error || "Unable to complete task")
  }
}

async function updateQuadrantRequest(id: string, quadrant: TaskQuadrant) {
  const response = await fetch(`/api/tasks/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ quadrant }),
  })
  const result = await readJson<{
    ok?: boolean
    error?: string
    task?: TaskCache
  }>(response)

  if (!response.ok || !result.ok || !result.task) {
    throw new Error(result.error || "Unable to move task")
  }

  return result.task
}

export function useTasks({
  initialTasks = [],
  initialError = null,
}: UseTasksOptions = {}) {
  const [tasks, setTasks] = useState(initialTasks)
  const [error, setError] = useState<string | null>(initialError)
  const [isLoading, startLoadingTransition] = useTransition()
  const [actionState, setActionState] = useState<TaskActionState>({
    syncing: false,
    completingIds: {},
    movingIds: {},
  })

  useEffect(() => {
    if (initialTasks.length > 0 || initialError) {
      return
    }

    startLoadingTransition(() => {
      void fetchTasksRequest()
        .then((nextTasks) => {
          setTasks(nextTasks)
          setError(null)
        })
        .catch((nextError: unknown) => {
          setError(
            nextError instanceof Error ? nextError.message : "Unable to load tasks",
          )
        })
    })
  }, [initialError, initialTasks])

  async function refresh() {
    const nextTasks = await fetchTasksRequest()
    setTasks(nextTasks)
    setError(null)
  }

  async function sync() {
    setActionState((current) => ({ ...current, syncing: true }))
    setError(null)

    try {
      const nextTasks = await syncTasksRequest()
      setTasks(nextTasks)
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : "Unable to sync tasks",
      )
      throw nextError
    } finally {
      setActionState((current) => ({ ...current, syncing: false }))
    }
  }

  async function complete(id: string) {
    const previousTasks = tasks
    setError(null)
    setActionState((current) => ({
      ...current,
      completingIds: { ...current.completingIds, [id]: true },
    }))
    setTasks((current) => current.filter((task) => task.id !== id))

    try {
      await completeTaskRequest(id)
    } catch (nextError) {
      setTasks(previousTasks)
      setError(
        nextError instanceof Error ? nextError.message : "Unable to complete task",
      )
      throw nextError
    } finally {
      setActionState((current) => {
        const nextCompletingIds = { ...current.completingIds }
        delete nextCompletingIds[id]

        return {
          ...current,
          completingIds: nextCompletingIds,
        }
      })
    }
  }

  async function moveTask(id: string, quadrant: TaskQuadrant) {
    const previousTasks = tasks
    setError(null)
    setActionState((current) => ({
      ...current,
      movingIds: { ...current.movingIds, [id]: true },
    }))
    setTasks((current) =>
      sortTasks(
        current.map((task) =>
          task.id === id
            ? {
                ...task,
                quadrant,
              }
            : task,
        ),
      ),
    )

    try {
      const nextTask = await updateQuadrantRequest(id, quadrant)
      setTasks((current) =>
        sortTasks(
          current.map((task) => (task.id === id ? nextTask : task)),
        ),
      )
    } catch (nextError) {
      setTasks(previousTasks)
      setError(nextError instanceof Error ? nextError.message : "Unable to move task")
      throw nextError
    } finally {
      setActionState((current) => {
        const nextMovingIds = { ...current.movingIds }
        delete nextMovingIds[id]

        return {
          ...current,
          movingIds: nextMovingIds,
        }
      })
    }
  }

  return {
    tasks,
    error,
    isLoading,
    isSyncing: actionState.syncing,
    completingIds: actionState.completingIds,
    movingIds: actionState.movingIds,
    refresh,
    sync,
    complete,
    moveTask,
  }
}
