"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import {
  WORK_ASSIGNMENT_STATUS_ORDER,
  WorkAssignmentStatus,
  WorkAssignmentStatusLabel,
} from "@/lib/console/domain/enums"
import type { WorkAssignment } from "@/types/console"

export function WorkStatusControl({
  assignmentId,
  current,
}: {
  assignmentId: string
  current: WorkAssignment["status"]
}) {
  const router = useRouter()
  const [status, setStatus] = useState<string>(current)
  const [reason, setReason] = useState("")
  const [pending, setPending] = useState(false)

  const needsReason = status === WorkAssignmentStatus.Blocked

  async function update() {
    if (status === current && !needsReason) return
    setPending(true)
    try {
      const res = await fetch(`/api/work/${assignmentId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reason: reason.trim() || undefined }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Failed to update status")
      toast.success("Status updated")
      setReason("")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="rounded-lg border border-border/70 bg-background px-3 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        {WORK_ASSIGNMENT_STATUS_ORDER.map((s) => (
          <option key={s} value={s}>
            {WorkAssignmentStatusLabel[s]}
          </option>
        ))}
      </select>
      {needsReason ? (
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for blocking"
          className="min-w-48 flex-1 rounded-lg border border-border/70 bg-background px-3 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        />
      ) : null}
      <button
        type="button"
        disabled={pending || (status === current && !needsReason)}
        onClick={update}
        className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50"
      >
        {pending ? "…" : "Update"}
      </button>
    </div>
  )
}
