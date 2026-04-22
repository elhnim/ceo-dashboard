"use client"

import type { CSSProperties } from "react"

import { cn } from "@/lib/utils"
import type { CalendarEventRecord } from "@/types/calendar"

interface CalendarEventBlockProps {
  event: CalendarEventRecord
  style?: CSSProperties
  onSelect: (event: CalendarEventRecord) => void
}

function formatTimeRange(event: CalendarEventRecord) {
  if (event.isAllDay) {
    return "All day"
  }

  return `${new Intl.DateTimeFormat("en-AU", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(event.startAt))} - ${new Intl.DateTimeFormat("en-AU", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(event.endAt))}`
}

export function CalendarEventBlock({
  event,
  style,
  onSelect,
}: CalendarEventBlockProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(event)}
      className={cn(
        "absolute inset-x-1 overflow-hidden rounded-2xl border px-3 py-2 text-left shadow-sm transition hover:shadow-md",
        event.calendarType === "work"
          ? "border-primary/20 bg-primary/12 text-foreground"
          : "border-border bg-secondary/70 text-foreground"
      )}
      style={style}
    >
      <p className="truncate text-sm font-medium">{event.title}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{formatTimeRange(event)}</p>
      {event.location ? (
        <p className="mt-1 truncate text-[11px] text-muted-foreground">
          {event.location}
        </p>
      ) : null}
    </button>
  )
}
