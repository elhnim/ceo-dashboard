"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ArrowRightIcon, SparklesIcon } from "lucide-react"

import { DashboardWidget } from "@/components/shared/DashboardWidget"
import { Button } from "@/components/ui/button"

type DoThisNextResult = {
  title: string
  reason: string
} | null

async function fetchDoThisNext() {
  const response = await fetch("/api/tasks/do-this-next", {
    cache: "no-store",
  })
  const result = (await response.json()) as {
    task?: DoThisNextResult
    error?: string
  }

  if (!response.ok) {
    throw new Error(result.error || "Unable to load the next task")
  }

  return result.task ?? null
}

export function DoThisNextWidget() {
  const [task, setTask] = useState<DoThisNextResult>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    void fetchDoThisNext()
      .then((nextTask) => {
        setTask(nextTask)
        setError(null)
      })
      .catch((nextError: unknown) => {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Unable to load the next task",
        )
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  return (
    <DashboardWidget
      title="Do This Next"
      icon={<SparklesIcon className="size-4 text-primary" />}
      className="border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card"
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="text-3xl font-semibold tracking-tight">
            {isLoading
              ? "Finding the next move..."
              : task?.title || "No task ready yet"}
          </p>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            {error
              ? error
              : task?.reason ||
                "Sync Microsoft To Do to surface the single task that matters most right now."}
          </p>
        </div>
        <Button size="lg" render={<Link href="/tasks" />}>
          Open tasks
          <ArrowRightIcon />
        </Button>
      </div>
    </DashboardWidget>
  )
}
