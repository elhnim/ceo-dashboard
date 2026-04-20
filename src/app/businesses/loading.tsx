import { Skeleton } from "@/components/ui/skeleton"

export default function BusinessesLoading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8">
      <section className="rounded-[28px] border border-border/70 p-6 shadow-sm md:p-8">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-4 h-10 w-56" />
        <Skeleton className="mt-4 h-5 w-full max-w-2xl" />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-xl border border-border/70 bg-card p-5 shadow-sm"
          >
            <Skeleton className="h-1.5 w-full" />
            <Skeleton className="mt-5 h-6 w-40" />
            <Skeleton className="mt-3 h-4 w-24" />
            <Skeleton className="mt-5 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-4/5" />
          </div>
        ))}
      </section>
    </div>
  )
}
