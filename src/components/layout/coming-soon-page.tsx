import { ArrowUpRightIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type ComingSoonPageProps = {
  title: string
  phase: string
  description: string
}

export function ComingSoonPage({
  title,
  phase,
  description,
}: ComingSoonPageProps) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-6">
      <div className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {phase}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground">
          {description}
        </p>
      </div>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ArrowUpRightIcon className="size-4 text-primary" />
            Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
          <p>This module is planned and reserved in the app shell.</p>
          <p>
            The layout, navigation, and route entry points are in place so the
            feature can be filled in during its scheduled build phase.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
