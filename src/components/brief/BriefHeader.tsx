"use client"

import { RefreshCw, RotateCcw, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"

interface BriefHeaderProps {
  generatedAt: string
  greeting: string
  firstName: string
  onResync: () => void
  onRegenerate: () => void
  onFullRefresh: () => void
  isRefreshing: boolean
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export function BriefHeader({
  generatedAt,
  greeting,
  firstName,
  onResync,
  onRegenerate,
  onFullRefresh,
  isRefreshing,
}: BriefHeaderProps) {
  return (
    <section className="space-y-4 rounded-[28px] border border-border/70 bg-gradient-to-br from-card via-card to-muted/40 p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground">
            My Day
          </p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            {greeting}, {firstName}
          </h1>
        </div>
        <div className="space-y-1 text-left md:text-right">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Generated
          </p>
          <p className="text-sm text-foreground/80">{formatTimestamp(generatedAt)}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={onResync} disabled={isRefreshing} variant="outline">
          <RefreshCw className={isRefreshing ? "animate-spin" : undefined} />
          Re-sync
        </Button>
        <Button onClick={onRegenerate} disabled={isRefreshing} variant="outline">
          <Sparkles className={isRefreshing ? "animate-spin" : undefined} />
          Regenerate
        </Button>
        <Button onClick={onFullRefresh} disabled={isRefreshing}>
          <RotateCcw className={isRefreshing ? "animate-spin" : undefined} />
          Re-sync + Regenerate
        </Button>
      </div>
    </section>
  )
}
