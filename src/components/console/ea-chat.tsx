"use client"

import { useEffect, useRef, useState } from "react"
import { SendIcon } from "lucide-react"
import { toast } from "sonner"

import { formatDateTime } from "@/lib/console/format"
import type { ConversationTurn } from "@/types/console"
import { cn } from "@/lib/utils"

const SUGGESTIONS = [
  "Give me an update.",
  "What needs my attention?",
  "Show me blocked work.",
  "What is the Product Manager working on?",
  "Prepare my morning brief.",
]

/** Minimal, safe markdown-ish rendering: bold + line breaks. */
function renderText(text: string) {
  const lines = text.split("\n")
  return lines.map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={j}>{part.slice(2, -2)}</strong>
      ) : (
        <span key={j}>{part}</span>
      ),
    )
    return (
      <span key={i}>
        {parts}
        {i < lines.length - 1 ? <br /> : null}
      </span>
    )
  })
}

export function EaChat({ initial }: { initial: ConversationTurn[] }) {
  const [turns, setTurns] = useState<ConversationTurn[]>(initial)
  const [message, setMessage] = useState("")
  const [pending, setPending] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [turns])

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || pending) return
    setPending(true)
    setMessage("")
    try {
      const res = await fetch("/api/ea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Failed to reach the EA")
      setTurns(json.data.conversation)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex min-h-[60vh] flex-col">
      <div className="flex-1 space-y-4">
        {turns.length === 0 ? (
          <div className="rounded-xl border border-border/60 bg-card px-4 py-5 text-sm leading-6 text-muted-foreground">
            I&apos;m Vera, your Executive Assistant. Ask me for an update, what needs your
            attention, or to prepare your morning brief.
          </div>
        ) : (
          turns.map((turn) => (
            <div
              key={turn.id}
              className={cn(
                "flex",
                turn.role === "director" ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-6",
                  turn.role === "director"
                    ? "bg-primary text-primary-foreground"
                    : "border border-border/60 bg-card",
                )}
              >
                {renderText(turn.text)}
                <span
                  className={cn(
                    "mt-1 block text-[0.65rem]",
                    turn.role === "director"
                      ? "text-primary-foreground/60"
                      : "text-muted-foreground",
                  )}
                >
                  {formatDateTime(turn.at)}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      <div className="sticky bottom-20 mt-6 space-y-3 md:bottom-4">
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              disabled={pending}
              onClick={() => send(s)}
              className="rounded-full border border-border/70 bg-card px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-border hover:text-foreground disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            send(message)
          }}
          className="flex items-end gap-2 rounded-2xl border border-border/70 bg-background p-2"
        >
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                send(message)
              }
            }}
            rows={1}
            placeholder="Message the Executive Assistant…"
            className="max-h-32 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={pending || !message.trim()}
            className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
          >
            <SendIcon className="size-4" />
          </button>
        </form>
      </div>
    </div>
  )
}
