"use client"

import type { CSSProperties } from "react"

import { cn } from "@/lib/utils"
import type { CalendarEventRecord } from "@/types/calendar"

interface CalendarEventBlockProps {
  event: CalendarEventRecord
  style?: CSSProperties
  onSelect: (event: CalendarEventRecord) => void
}

function formatTime(iso: string) {
  return new Intl.DateTimeFormat("en-AU", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso))
}

export function CalendarEventBlock({
  event,
  style,
  onSelect,
}: CalendarEventBlockProps) {
  const isWork = event.calendarType === "work"

  return (
    <button
      type="button"
      onClick={() => onSelect(event)}
      className={cn(
        "absolute inset-x-1 overflow-hidden rounded-xl border-l-4 px-3 py-2 text-left shadow-sm transition hover:shadow-md hover:brightness-95",
        isWork
          ? "border-l-primary bg-primary/10 text-foreground"
          : "border-l-violet-400 bg-violet-50 text-foreground dark:bg-violet-950/30"
      )}
      style={style}
    >
      <p className="truncate text-sm font-semibold leading-tight">{event.title}</p>
      <p className={cn("mt-0.5 text-xs", isWork ? "text-primary/70" : "text-violet-500")}>
        {formatTime(event.startAt)} – {formatTime(event.endAt)}
      </p>
      {event.location ? (
        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
          {event.location}
        </p>
      ) : null}
    </button>
  )
}
