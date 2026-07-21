import Link from "next/link"

export default function ConsoleNotFound() {
  return (
    <div className="rounded-xl border border-border/70 bg-card px-6 py-10 text-center">
      <h2 className="text-lg font-semibold">Not found</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        That officer, assignment, or decision doesn&apos;t exist.
      </p>
      <Link
        href="/console"
        className="mt-6 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Back to Home
      </Link>
    </div>
  )
}
