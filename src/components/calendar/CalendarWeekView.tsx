"use client"

import { useEffect, useState } from "react"
import { CalendarIcon, MapPinIcon, UsersIcon } from "lucide-react"

import { CalendarEventBlock } from "@/components/calendar/CalendarEventBlock"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { CalendarEventRecord } from "@/types/calendar"

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const
const START_HOUR = 5
const END_HOUR = 22
const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => i + START_HOUR)
const HOUR_HEIGHT = 72

interface CalendarWeekViewProps {
  events: CalendarEventRecord[]
  weekStartIso: string
}

function formatDayLabel(date: Date) {
  return new Intl.DateTimeFormat("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date)
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value))
}

function getDayIndex(weekStart: Date, value: string) {
  const eventDate = new Date(value)
  const diff = eventDate.getTime() - weekStart.getTime()
  return Math.floor(diff / (24 * 60 * 60 * 1000))
}

function getMinutesSinceMidnight(value: string) {
  const date = new Date(value)
  return date.getHours() * 60 + date.getMinutes()
}

export function CalendarWeekView({
  events,
  weekStartIso,
}: CalendarWeekViewProps) {
  const weekStart = new Date(weekStartIso)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventRecord | null>(null)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date())
    }, 60_000)

    return () => window.clearInterval(timer)
  }, [])

  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart)
    date.setDate(weekStart.getDate() + index)
    return date
  })

  const allDayEvents = events.filter((event) => event.isAllDay)
  const timedEvents = events.filter((event) => !event.isAllDay)
  const todayIndex = getDayIndex(weekStart, now.toISOString())
  const nowMinutes = getMinutesSinceMidnight(now.toISOString())

  return (
    <>
      <div className="overflow-hidden rounded-[28px] border border-border/70 bg-card shadow-sm">
        <div className="border-b border-border/70 bg-muted/30 px-4 py-4">
          <div className="grid min-w-[880px] grid-cols-[72px_repeat(7,minmax(0,1fr))] gap-3">
            <div />
            {weekDays.map((date) => (
              <div key={date.toISOString()} className="space-y-1">
                <p className="text-sm font-medium">{formatDayLabel(date)}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {DAY_NAMES[getDayIndex(weekStart, date.toISOString())]}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[880px]">
            <div className="grid grid-cols-[72px_repeat(7,minmax(0,1fr))] gap-3 border-b border-border/70 bg-muted/15 px-4 py-4">
              <div className="pt-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                All day
              </div>
              {weekDays.map((date, index) => {
                const dayEvents = allDayEvents.filter(
                  (event) => getDayIndex(weekStart, event.startAt) === index
                )

                return (
                  <div key={date.toISOString()} className="flex min-h-14 flex-wrap gap-2">
                    {dayEvents.length ? (
                      dayEvents.map((event) => (
                        <button
                          key={event.id}
                          type="button"
                          onClick={() => setSelectedEvent(event)}
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            event.calendarType === "work"
                              ? "bg-primary/12 text-primary"
                              : "bg-secondary text-secondary-foreground"
                          }`}
                        >
                          {event.title}
                        </button>
                      ))
                    ) : (
                      <div className="rounded-full border border-dashed border-border px-3 py-1 text-xs text-muted-foreground">
                        Free
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="grid grid-cols-[72px_repeat(7,minmax(0,1fr))] gap-3 px-4 pb-6">
              <div className="relative">
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="relative border-b border-dashed border-border/60"
                    style={{ height: HOUR_HEIGHT }}
                  >
                    <span className="absolute -top-2 left-0 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      {hour === 0
                        ? "12 AM"
                        : hour < 12
                          ? `${hour} AM`
                          : hour === 12
                            ? "12 PM"
                            : `${hour - 12} PM`}
                    </span>
                  </div>
                ))}
              </div>

              {weekDays.map((date, index) => {
                const dayEvents = timedEvents.filter(
                  (event) => getDayIndex(weekStart, event.startAt) === index
                )

                return (
                  <div
                    key={date.toISOString()}
                    className="relative border-l border-border/70"
                    style={{ height: (END_HOUR - START_HOUR + 1) * HOUR_HEIGHT }}
                  >
                    {HOURS.map((hour) => (
                      <div
                        key={hour}
                        className="border-b border-dashed border-border/60"
                        style={{ height: HOUR_HEIGHT }}
                      />
                    ))}

                    {todayIndex === index && nowMinutes >= START_HOUR * 60 && nowMinutes <= (END_HOUR + 1) * 60 ? (
                      <div
                        className="absolute inset-x-0 z-10 h-0.5 bg-destructive"
                        style={{ top: ((nowMinutes - START_HOUR * 60) / 60) * HOUR_HEIGHT }}
                      />
                    ) : null}

                    {dayEvents.map((event) => {
                      const startMinutes = getMinutesSinceMidnight(event.startAt)
                      const endMinutes =
                        (new Date(event.endAt).getTime() -
                          new Date(event.startAt).getTime()) /
                          60_000 +
                        startMinutes
                      const windowStart = START_HOUR * 60
                      const windowEnd = (END_HOUR + 1) * 60
                      const visibleStart = Math.max(startMinutes, windowStart)
                      const visibleEnd = Math.min(endMinutes, windowEnd)

                      if (visibleEnd <= windowStart || visibleStart >= windowEnd) {
                        return null
                      }

                      return (
                        <CalendarEventBlock
                          key={event.id}
                          event={event}
                          onSelect={setSelectedEvent}
                          style={{
                            top: ((visibleStart - windowStart) / 60) * HOUR_HEIGHT,
                            height: Math.max(((visibleEnd - visibleStart) / 60) * HOUR_HEIGHT, 40),
                          }}
                        />
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <Sheet open={Boolean(selectedEvent)} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <SheetContent className="w-full sm:max-w-md">
          {selectedEvent ? (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={selectedEvent.calendarType === "work" ? "default" : "secondary"}
                  >
                    {selectedEvent.calendarType}
                  </Badge>
                  <Badge variant="outline">{selectedEvent.provider}</Badge>
                </div>
                <SheetTitle className="mt-3">{selectedEvent.title}</SheetTitle>
                <SheetDescription>
                  {selectedEvent.isAllDay
                    ? "All day"
                    : `${formatDateTime(selectedEvent.startAt)} to ${formatDateTime(
                        selectedEvent.endAt
                      )}`}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 px-4 pb-4">
                {selectedEvent.location ? (
                  <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-muted/20 px-4 py-3">
                    <MapPinIcon className="mt-0.5 size-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        Location
                      </p>
                      <p className="mt-1 text-sm">{selectedEvent.location}</p>
                    </div>
                  </div>
                ) : null}

                <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-muted/20 px-4 py-3">
                  <CalendarIcon className="mt-0.5 size-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Sync status
                    </p>
                    <p className="mt-1 text-sm">
                      Synced {formatDateTime(selectedEvent.syncedAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-muted/20 px-4 py-3">
                  <UsersIcon className="mt-0.5 size-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Attendees
                    </p>
                    {selectedEvent.attendees.length ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedEvent.attendees.map((attendee) => (
                          <Badge key={attendee} variant="outline">
                            {attendee}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-1 text-sm text-muted-foreground">
                        No attendees listed.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  )
}
