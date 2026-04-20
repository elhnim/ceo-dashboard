import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const focusCards = [
  {
    title: "Today’s priorities",
    description: "Capture the three outcomes that matter before the day fills up.",
  },
  {
    title: "Do this next",
    description: "Keep one visible next action so the dashboard reduces switching friction.",
  },
  {
    title: "Reflection",
    description: "Close the loop at the end of the day with a short review and reset.",
  },
] as const

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8">
      <section className="rounded-[28px] border border-border/70 bg-gradient-to-br from-card via-card to-muted/70 p-6 shadow-sm md:p-8">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground">
          Phase 1 foundation
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
          My Day
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
          This home view is the shell for the CEO’s daily rhythm. The full ritual
          flow will land in a later task, but the route and layout are now ready.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {focusCards.map((card) => (
          <Card key={card.title} className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">{card.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-6 text-muted-foreground">
              {card.description}
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  )
}
