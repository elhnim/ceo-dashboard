import { auth } from "@/lib/auth"
import { formatDate, getGreeting } from "@/lib/greeting"
import { ActiveOKRsWidget } from "@/components/shared/ActiveOKRsWidget"
import { CalendarWidget } from "@/components/shared/CalendarWidget"
import { DoThisNextWidget } from "@/components/shared/DoThisNextWidget"
import { QuickActionsWidget } from "@/components/shared/QuickActionsWidget"
import { TopPrioritiesWidget } from "@/components/shared/TopPrioritiesWidget"
import { UrgentEmailWidget } from "@/components/shared/UrgentEmailWidget"

function getFirstName(name: string | null | undefined) {
  return name?.trim().split(/\s+/)[0] || "there"
}

export default async function Home() {
  const session = await auth()
  const firstName = getFirstName(session?.user?.name)
  const greeting = getGreeting()
  const today = formatDate(new Date())

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8">
      <section className="rounded-[28px] border border-border/70 bg-gradient-to-br from-card via-card to-muted/60 p-6 shadow-sm md:p-8">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground">
          My Day
        </p>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              {greeting}, {firstName}
            </h1>
            <p className="text-base leading-7 text-muted-foreground">{today}</p>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            A calm command center for the day ahead. Keep the next decision
            obvious, the priorities visible, and the noise pushed to the edges.
          </p>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <DoThisNextWidget />
        <TopPrioritiesWidget />
        <CalendarWidget />
        <ActiveOKRsWidget />
        <UrgentEmailWidget />
        <QuickActionsWidget />
      </section>
    </div>
  )
}
