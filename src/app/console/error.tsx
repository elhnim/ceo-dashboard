"use client"

export default function ConsoleError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-card px-6 py-10 text-center">
      <h2 className="text-lg font-semibold">Something interrupted the briefing</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {error.message || "An unexpected error occurred while loading the console."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Try again
      </button>
    </div>
  )
}
