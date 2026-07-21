"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import type { DeliverableReviewOutcome } from "@/lib/console/domain/transitions"
import { cn } from "@/lib/utils"

const ACTIONS: { outcome: DeliverableReviewOutcome; label: string; primary?: boolean }[] = [
  { outcome: "approve", label: "Approve", primary: true },
  { outcome: "request-revision", label: "Request revision" },
  { outcome: "reject", label: "Reject" },
]

export function DeliverableReview({ deliverableId }: { deliverableId: string }) {
  const router = useRouter()
  const [comment, setComment] = useState("")
  const [pending, setPending] = useState<string | null>(null)

  async function review(outcome: DeliverableReviewOutcome) {
    setPending(outcome)
    try {
      const res = await fetch(`/api/console/deliverables/${deliverableId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outcome, comment: comment.trim() }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Failed to submit review")
      toast.success(outcome === "approve" ? "Deliverable approved" : "Review recorded")
      setComment("")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setPending(null)
    }
  }

  return (
    <div className="space-y-3">
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        placeholder="Review comment (optional)"
        className="w-full resize-none rounded-lg border border-border/70 bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
      />
      <div className="flex flex-wrap gap-2">
        {ACTIONS.map((a) => (
          <button
            key={a.outcome}
            type="button"
            disabled={pending !== null}
            onClick={() => review(a.outcome)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50",
              a.primary
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "border border-border text-foreground hover:bg-muted",
            )}
          >
            {pending === a.outcome ? "…" : a.label}
          </button>
        ))}
      </div>
    </div>
  )
}
