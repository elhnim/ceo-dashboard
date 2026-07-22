"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PlayIcon } from "lucide-react"
import { toast } from "sonner"

/** Starts today's executive session and opens the agenda. */
export function BeginSessionButton() {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function begin() {
    setPending(true)
    try {
      const res = await fetch("/api/project/session", { method: "POST" })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "No session is ready")
      router.push("/session")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
      setPending(false)
    }
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={begin}
      className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
    >
      <PlayIcon className="size-4" />
      {pending ? "Opening…" : "Begin Session"}
    </button>
  )
}

/** Approve / defer an executive approval from the Waiting For Me panel. */
export function ApprovalActions({ approvalId }: { approvalId: string }) {
  const router = useRouter()
  const [pending, setPending] = useState<string | null>(null)

  async function resolve(resolution: "approved" | "deferred") {
    setPending(resolution)
    try {
      const res = await fetch(`/api/project/approvals/${approvalId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolution }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Failed to record the decision")
      toast.success(resolution === "approved" ? "Approved" : "Deferred")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setPending(null)
    }
  }

  return (
    <div className="flex shrink-0 gap-2">
      <button
        type="button"
        disabled={pending !== null}
        onClick={() => resolve("approved")}
        className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {pending === "approved" ? "…" : "Approve"}
      </button>
      <button
        type="button"
        disabled={pending !== null}
        onClick={() => resolve("deferred")}
        className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50"
      >
        {pending === "deferred" ? "…" : "Defer"}
      </button>
    </div>
  )
}
