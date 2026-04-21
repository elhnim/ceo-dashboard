import { CalendarPageClient } from "@/components/calendar/CalendarPageClient"
import { requireAuth } from "@/lib/auth"
import { getWeekRange, listCalendarEvents } from "@/lib/services/calendar"

export default async function CalendarPage() {
  await requireAuth()
  const { start, end } = getWeekRange()
  let initialEvents: Awaited<ReturnType<typeof listCalendarEvents>> = []
  let initialError: string | null = null

  try {
    initialEvents = await listCalendarEvents(start, end)
  } catch (error) {
    initialError =
      error instanceof Error ? error.message : "Unable to load calendar events"
  }

  return (
    <div className="mx-auto flex w-full max-w-[110rem] flex-1 flex-col gap-8">
      <CalendarPageClient
        initialEvents={initialEvents}
        initialError={initialError}
        weekStartIso={start.toISOString()}
        weekEndIso={end.toISOString()}
      />
    </div>
  )
}
