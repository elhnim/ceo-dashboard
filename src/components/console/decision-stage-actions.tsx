"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import {
  DECISION_STAGE_TRANSITIONS,
  DecisionStageLabel,
} from "@/lib/console/domain/enums"
import type { DecisionStage } from "@/lib/console/domain/enums"

const ADVANCE_LABEL: Partial<Record<DecisionStage, string>> = {
  "needs-review": "Send for review",
  ready: "Mark ready",
  executed: "Mark executed",
  verified: "Verify outcome",
}

/** Advance an approved decision through execution and verification. */
export function DecisionStageActions({
  decisionId,
  stage,
}: {
  decisionId: string
  stage: DecisionStage
}) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const nextStages = DECISION_STAGE_TRANSITIONS[stage]

  async function advance(next: DecisionStage) {
    setPending(true)
    try {
      const res = await fetch(`/api/decisions/${decisionId}/stage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: next }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Failed to advance the decision")
      toast.success(`Decision ${DecisionStageLabel[next].toLowerCase()}`)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setPending(false)
    }
  }

  if (nextStages.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {nextStages.map((next) => (
        <button
          key={next}
          type="button"
          disabled={pending}
          onClick={() => advance(next)}
          className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50"
        >
          {pending ? "…" : ADVANCE_LABEL[next] ?? DecisionStageLabel[next]}
        </button>
      ))}
    </div>
  )
}
