"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PlusIcon } from "lucide-react"
import { toast } from "sonner"

import { Priority, PriorityLabel, enumValues } from "@/lib/console/domain/enums"

export function AssignWorkPanel({
  ownerOfficerAssignmentId,
  officerName,
}: {
  ownerOfficerAssignmentId: string
  officerName: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [title, setTitle] = useState("")
  const [objective, setObjective] = useState("")
  const [priority, setPriority] = useState<string>(Priority.Medium)
  const [criteria, setCriteria] = useState("")

  async function submit() {
    if (!title.trim() || !objective.trim()) {
      toast.error("Title and objective are required")
      return
    }
    setPending(true)
    try {
      const res = await fetch("/api/work", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          objective: objective.trim(),
          ownerOfficerAssignmentId,
          priority,
          acceptanceCriteria: criteria
            .split("\n")
            .map((c) => c.trim())
            .filter(Boolean),
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Failed to create assignment")
      toast.success("Assignment routed")
      setTitle("")
      setObjective("")
      setCriteria("")
      setPriority(Priority.Medium)
      setOpen(false)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setPending(false)
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        <PlusIcon className="size-4" />
        Assign work
      </button>
    )
  }

  return (
    <div className="w-full rounded-xl border border-border/70 bg-card p-4 sm:p-5">
      <p className="mb-4 text-sm font-semibold">New assignment for {officerName}</p>
      <div className="space-y-3">
        <Field label="Title">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            placeholder="What should be produced?"
          />
        </Field>
        <Field label="Objective">
          <textarea
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            rows={2}
            className="w-full resize-none rounded-lg border border-border/70 bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            placeholder="The outcome this work serves."
          />
        </Field>
        <Field label="Priority">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            {enumValues(Priority).map((p) => (
              <option key={p} value={p}>
                {PriorityLabel[p]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Acceptance criteria">
          <textarea
            value={criteria}
            onChange={(e) => setCriteria(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-lg border border-border/70 bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            placeholder="One per line."
          />
        </Field>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={submit}
          className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {pending ? "Routing…" : "Create assignment"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => setOpen(false)}
          className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  )
}
