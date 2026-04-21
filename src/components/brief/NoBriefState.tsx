"use client"

import { FileText } from "lucide-react"

import { Button } from "@/components/ui/button"

interface NoBriefStateProps {
  onGenerate: () => void
  isRefreshing: boolean
}

export function NoBriefState({
  onGenerate,
  isRefreshing,
}: NoBriefStateProps) {
  return (
    <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center rounded-[28px] border border-dashed border-border/80 bg-card/60 px-6 py-16 text-center shadow-sm">
      <div className="rounded-full border border-border/70 bg-background p-3">
        <FileText className="size-5 text-muted-foreground" />
      </div>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight">
        No brief generated yet.
      </h1>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        Generate your first EA briefing to turn My Day into a focused summary of
        what matters right now.
      </p>
      <Button onClick={onGenerate} disabled={isRefreshing} className="mt-6">
        Generate your first brief
      </Button>
    </section>
  )
}
