"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import {
  COMMITMENT_TRANSITIONS,
  CommitmentStatus,
  CommitmentStatusLabel,
} from "@/lib/console/domain/enums"
import type { Commitment } from "@/types/console"
import { cn } from "@/lib/utils"

const ACTION_LABEL: Partial<Record<CommitmentStatus, string>> = {
  committed: "Commit",
  "in-progress": "Start work",
  blocked: "Block",
  completed: "Mark delivered",
  verified: "Verify outcome",
}

/** Offers only the legal next steps for the commitment's current status. */
export function CommitmentActions({
  commitmentId,
  current,
}: {
  commitmentId: string
  current: Commitment["status"]
}) {
  const router = useRouter()
  const [reason, setReason] = useState("")
  const [pending, setPending] = useState<string | null>(null)

  const nextStatuses = COMMITMENT_TRANSITIONS[current]

  async function move(status: CommitmentStatus) {
    if (status === CommitmentStatus.Blocked && !reason.trim()) {
      toast.error("Give a reason for blocking")
      return
    }
    setPending(status)
    try {
      const res = await fetch(`/api/commitments/${commitmentId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          reason: status === CommitmentStatus.Blocked ? reason.trim() : undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Failed to update the commitment")
      toast.success(`${CommitmentStatusLabel[status]}`)
      setReason("")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setPending(null)
    }
  }

  if (nextStatuses.length === 0) {
    return <p className="text-sm text-muted-foreground">Verified — this commitment is closed.</p>
  }

  const showsBlock = nextStatuses.includes(CommitmentStatus.Blocked)

  return (
    <div className="space-y-3">
      {showsBlock ? (
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason (required to block)"
          className="w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
        />
      ) : null}
      <div className="flex flex-wrap gap-2">
        {nextStatuses.map((status) => (
          <button
            key={status}
            type="button"
            disabled={pending !== null}
            onClick={() => move(status)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50",
              status === CommitmentStatus.Verified || status === CommitmentStatus.Completed
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : status === CommitmentStatus.Blocked
                  ? "border border-red-500/40 text-red-600 hover:bg-red-500/10 dark:text-red-400"
                  : "border border-border text-foreground hover:bg-muted",
            )}
          >
            {pending === status ? "…" : ACTION_LABEL[status] ?? CommitmentStatusLabel[status]}
          </button>
        ))}
      </div>
    </div>
  )
}

export function CommitmentNoteForm({ commitmentId }: { commitmentId: string }) {
  const router = useRouter()
  const [note, setNote] = useState("")
  const [pending, setPending] = useState(false)

  async function submit() {
    if (!note.trim()) return
    setPending(true)
    try {
      const res = await fetch(`/api/commitments/${commitmentId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: note.trim() }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Failed to add the note")
      toast.success("Note added")
      setNote("")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setPending(false)
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
      className="flex items-end gap-2"
    >
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={1}
        placeholder="Add a note…"
        className="max-h-24 flex-1 resize-none rounded-lg border border-border/70 bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
      />
      <button
        type="submit"
        disabled={pending || !note.trim()}
        className="rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
      >
        {pending ? "…" : "Add"}
      </button>
    </form>
  )
}
