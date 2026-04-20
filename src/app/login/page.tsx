import { redirect } from "next/navigation"

import { MicrosoftSignInButton } from "@/components/auth/microsoft-sign-in-button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { auth } from "@/lib/auth"

export default async function LoginPage() {
  const session = await auth()

  if (session) {
    redirect("/")
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-[radial-gradient(circle_at_top,_hsl(var(--muted))_0%,_transparent_45%),linear-gradient(180deg,_hsl(var(--background))_0%,_hsl(var(--muted)/0.35)_100%)] px-4 py-10">
      <Card className="w-full max-w-md border-border/70 shadow-lg shadow-black/5">
        <CardHeader className="space-y-3 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Welcome Back
          </p>
          <CardTitle className="text-3xl font-semibold tracking-tight">
            CEO Dashboard
          </CardTitle>
          <p className="text-sm leading-6 text-muted-foreground">
            Sign in with your Microsoft account to unlock the dashboard and
            connect your Microsoft workspace.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <MicrosoftSignInButton />
          <div className="rounded-2xl border border-border/70 bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">
            Your session will also carry the Microsoft access token needed for
            later Outlook, Calendar, and To Do integrations.
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
