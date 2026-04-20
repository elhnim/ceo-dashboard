import { AlertTriangleIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type BusinessesUnavailableStateProps = {
  title?: string
  message: string
}

export function BusinessesUnavailableState({
  title = "Businesses are not ready yet",
  message,
}: BusinessesUnavailableStateProps) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-6">
      <div className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Supabase setup needed
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground">
          The app can reach Supabase, but the CEO Dashboard tables are not
          readable through the project API yet.
        </p>
      </div>

      <Card className="border-amber-200 bg-amber-50/60 shadow-sm dark:border-amber-900/60 dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangleIcon className="size-4 text-amber-600 dark:text-amber-400" />
            Action Needed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
          <p>{message}</p>
          <p>
            After the schema is reapplied or the API schema cache is refreshed in
            Supabase, reload this page and the business CRUD should come online.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
