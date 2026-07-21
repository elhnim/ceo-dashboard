export default function ConsoleLoading() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="space-y-2">
        <div className="h-3 w-28 rounded bg-muted" />
        <div className="h-8 w-64 rounded bg-muted" />
        <div className="h-4 w-80 rounded bg-muted" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl border border-border/60 bg-card" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl border border-border/60 bg-card" />
        ))}
      </div>
    </div>
  )
}
