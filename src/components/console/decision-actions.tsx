"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { DecisionAction, DecisionActionLabel } from "@/lib/console/domain/enums"
import { cn } from "@/lib/utils"

const PRIMARY: (typeof DecisionAction)[keyof typeof DecisionAction][] = [
  DecisionAction.Approve,
  DecisionAction.Reject,
]
const SECONDARY: (typeof DecisionAction)[keyof typeof DecisionAction][] = [
  DecisionAction.Modify,
  DecisionAction.Discuss,
  DecisionAction.Delegate,
  DecisionAction.Defer,
]

export function DecisionActions({ decisionId }: { decisionId: string }) {
  const router = useRouter()
  const [rationale, setRationale] = useState("")
  const [pending, setPending] = useState<string | null>(null)

  async function resolve(action: string) {
    setPending(action)
    try {
      const res = await fetch(`/api/decisions/${decisionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, rationale: rationale.trim() || undefined }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Failed to resolve decision")
      toast.success(`Decision ${DecisionActionLabel[action as keyof typeof DecisionActionLabel]?.toLowerCase() ?? action}`)
      setRationale("")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setPending(null)
    }
  }

  return (
    <div className="w-full space-y-3">
      <textarea
        value={rationale}
        onChange={(e) => setRationale(e.target.value)}
        placeholder="Add a rationale (optional — recorded with the decision)"
        rows={2}
        className="w-full resize-none rounded-lg border border-border/70 bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
      />
      <div className="flex flex-wrap gap-2">
        {PRIMARY.map((action) => (
          <button
            key={action}
            type="button"
            disabled={pending !== null}
            onClick={() => resolve(action)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50",
              action === DecisionAction.Approve
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "border border-border text-foreground hover:bg-muted",
            )}
          >
            {pending === action ? "…" : DecisionActionLabel[action]}
          </button>
        ))}
        <span className="mx-1 hidden w-px self-stretch bg-border sm:block" />
        {SECONDARY.map((action) => (
          <button
            key={action}
            type="button"
            disabled={pending !== null}
            onClick={() => resolve(action)}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            {pending === action ? "…" : DecisionActionLabel[action]}
          </button>
        ))}
      </div>
    </div>
  )
}
