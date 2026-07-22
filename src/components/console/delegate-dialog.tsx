"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { SendIcon, XIcon } from "lucide-react"
import { toast } from "sonner"

import {
  ConfidenceLevel,
  ConfidenceLevelLabel,
  enumValues,
} from "@/lib/console/domain/enums"

interface OfficerOption {
  id: string
  name: string
  roleTitle: string
}

/**
 * The Delegate flow: choose an officer, define the outcome and success
 * criteria, set a due date — a Commitment is created without leaving the
 * current page. Rendered globally from the console shell.
 */
export function DelegateDialog({
  open,
  onClose,
  defaultOfficerId,
}: {
  open: boolean
  onClose: () => void
  defaultOfficerId?: string
}) {
  const router = useRouter()
  const [officers, setOfficers] = useState<OfficerOption[]>([])
  const [officerId, setOfficerId] = useState(defaultOfficerId ?? "")
  const [outcome, setOutcome] = useState("")
  const [criteria, setCriteria] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [confidence, setConfidence] = useState<string>(ConfidenceLevel.Medium)
  const [pending, setPending] = useState<"delegate" | "draft" | null>(null)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    fetch("/api/organization/officers")
      .then((res) => res.json())
      .then((json) => {
        if (cancelled || !json.data) return
        setOfficers(json.data)
        setOfficerId((current) => current || defaultOfficerId || json.data[0]?.id || "")
      })
      .catch(() => toast.error("Couldn't load the officer list"))
    return () => {
      cancelled = true
    }
  }, [open, defaultOfficerId])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null

  async function submit(asDraft: boolean) {
    if (!officerId) {
      toast.error("Choose an officer")
      return
    }
    if (!outcome.trim()) {
      toast.error("Define the outcome you need")
      return
    }
    setPending(asDraft ? "draft" : "delegate")
    try {
      const res = await fetch("/api/commitments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: outcome.trim().split("\n")[0].slice(0, 120),
          outcome: outcome.trim(),
          ownerOfficerAssignmentId: officerId,
          successCriteria: criteria
            .split("\n")
            .map((c) => c.trim())
            .filter(Boolean),
          dueDate: dueDate ? new Date(`${dueDate}T00:00:00.000Z`).toISOString() : null,
          confidence,
          asDraft,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Failed to create the commitment")
      toast.success(asDraft ? "Draft saved" : "Commitment created")
      setOutcome("")
      setCriteria("")
      setDueDate("")
      setConfidence(ConfidenceLevel.Medium)
      onClose()
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setPending(null)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Delegate an outcome"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-border/70 bg-background p-5 shadow-xl sm:rounded-2xl sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Delegate an outcome</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              The officer commits to delivering it. You verify the result.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        <div className="space-y-4">
          <Field label="Officer">
            <select
              value={officerId}
              onChange={(e) => setOfficerId(e.target.value)}
              className="w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              {officers.length === 0 ? <option value="">Loading officers…</option> : null}
              {officers.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} — {o.roleTitle}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Outcome">
            <textarea
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              rows={2}
              placeholder="What result do you need? Plain language."
              className="w-full resize-none rounded-lg border border-border/70 bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
            />
          </Field>
          <Field label="Success criteria">
            <textarea
              value={criteria}
              onChange={(e) => setCriteria(e.target.value)}
              rows={3}
              placeholder="How you'll know it's done. One per line."
              className="w-full resize-none rounded-lg border border-border/70 bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/40"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Due date">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              />
            </Field>
            <Field label="Confidence">
              <select
                value={confidence}
                onChange={(e) => setConfidence(e.target.value)}
                className="w-full rounded-lg border border-border/70 bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                {enumValues(ConfidenceLevel).map((c) => (
                  <option key={c} value={c}>
                    {ConfidenceLevelLabel[c]}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending !== null}
            onClick={() => submit(false)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <SendIcon className="size-4" />
            {pending === "delegate" ? "Delegating…" : "Delegate"}
          </button>
          <button
            type="button"
            disabled={pending !== null}
            onClick={() => submit(true)}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
          >
            {pending === "draft" ? "Saving…" : "Save as draft"}
          </button>
        </div>
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

/** A button that opens the Delegate dialog — usable anywhere. */
export function DelegateButton({
  defaultOfficerId,
  variant = "primary",
}: {
  defaultOfficerId?: string
  variant?: "primary" | "sidebar"
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          variant === "sidebar"
            ? "flex w-full items-center justify-center gap-2 rounded-lg border border-border/70 bg-card px-3 py-2 text-sm font-medium transition-colors hover:border-border hover:bg-muted"
            : "inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        }
      >
        <SendIcon className="size-4" />
        Delegate
      </button>
      <DelegateDialog
        open={open}
        onClose={() => setOpen(false)}
        defaultOfficerId={defaultOfficerId}
      />
    </>
  )
}
