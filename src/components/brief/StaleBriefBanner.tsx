"use client"

import { AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"

interface StaleBriefBannerProps {
  generatedAt: string
  hasSyncErrors: boolean
  latestErrorMessage?: string | null
  onRefresh: () => void
  isRefreshing: boolean
}

function getHoursAgo(value: string) {
  const elapsed = Date.now() - new Date(value).getTime()
  return Math.max(1, Math.round(elapsed / (1000 * 60 * 60)))
}

export function StaleBriefBanner({
  generatedAt,
  hasSyncErrors,
  latestErrorMessage,
  onRefresh,
  isRefreshing,
}: StaleBriefBannerProps) {
  const age = getHoursAgo(generatedAt)

  return (
    <section className="rounded-[20px] border border-amber-300/60 bg-amber-50 p-4 text-amber-950 shadow-sm dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-medium">
            <AlertTriangle className="size-4" />
            <span>
              Brief last updated {age} {age === 1 ? "hour" : "hours"} ago
            </span>
          </div>
          <p className="text-sm">
            {hasSyncErrors
              ? latestErrorMessage ?? "Recent sync activity reported an error."
              : "Data may be stale."}
          </p>
        </div>
        <Button
          onClick={onRefresh}
          disabled={isRefreshing}
          variant="outline"
          className="border-amber-300 bg-transparent text-amber-950 hover:bg-amber-100 dark:border-amber-500/40 dark:text-amber-100 dark:hover:bg-amber-500/20"
        >
          Refresh now
        </Button>
      </div>
    </section>
  )
}
