"use client"

import { useState, useTransition } from "react"
import { RefreshCwIcon } from "lucide-react"
import { toast } from "sonner"

import { CalendarWeekView } from "@/components/calendar/CalendarWeekView"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type {
  CalendarEventRecord,
  CalendarEventsResponse,
  CalendarSyncResponse,
} from "@/types/calendar"

interface CalendarPageClientProps {
  initialEvents: CalendarEventRecord[]
  weekStartIso: string
  weekEndIso: string
  initialError: string | null
}

export function CalendarPageClient({
  initialEvents,
  weekStartIso,
  weekEndIso,
  initialError,
}: CalendarPageClientProps) {
  const [events, setEvents] = useState(initialEvents)
  const [error, setError] = useState(initialError)
  const [isPending, startTransition] = useTransition()

  function refreshEvents() {
    startTransition(async () => {
      const response = await fetch(
        `/api/calendar/events?from=${encodeURIComponent(weekStartIso)}&to=${encodeURIComponent(weekEndIso)}`,
        { cache: "no-store" }
      )
      const payload = (await response.json()) as CalendarEventsResponse

      if (!response.ok) {
        setError(payload.error || "Unable to load calendar events")
        return
      }

      setEvents(payload.events)
      setError(null)
    })
  }

  function syncCalendar() {
    startTransition(async () => {
      const response = await fetch("/api/calendar/sync", {
        method: "POST",
      })
      const payload = (await response.json()) as CalendarSyncResponse

      if (!response.ok) {
        const message = payload.error || "Unable to sync calendar events"
        setError(message)
        toast.error(message)
        return
      }

      if (payload.warnings.length) {
        toast.warning(payload.warnings.join(" "))
      } else {
        toast.success(`Synced ${payload.event_count} events`)
      }

      refreshEvents()
    })
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-[28px] border-border/70 bg-gradient-to-br from-card via-card to-muted/40">
        <CardHeader className="gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground">
              This week
            </p>
            <CardTitle className="text-3xl font-semibold tracking-tight md:text-4xl">
              Calendar
            </CardTitle>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={refreshEvents} disabled={isPending}>
              Refresh cache
            </Button>
            <Button onClick={syncCalendar} disabled={isPending}>
              <RefreshCwIcon className={isPending ? "animate-spin" : ""} />
              Sync calendars
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pb-6">
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            Outlook and iCloud events are merged into one week view so work and
            personal commitments stay visible in the same plan.
          </p>
          {error ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <CalendarWeekView events={events} weekStartIso={weekStartIso} />
    </div>
  )
}
