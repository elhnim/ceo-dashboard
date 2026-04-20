import { Skeleton } from "@/components/ui/skeleton"

export default function BusinessDetailLoading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8">
      <section className="rounded-[28px] border border-border/70 p-6 shadow-sm md:p-8">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="mt-4 h-10 w-72" />
        <Skeleton className="mt-4 h-5 w-full max-w-3xl" />
        <Skeleton className="mt-2 h-5 w-4/5 max-w-2xl" />
      </section>

      <section className="space-y-4">
        <Skeleton className="h-8 w-72" />
        <div className="rounded-xl border border-border/70 p-5 shadow-sm">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-4 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-5/6" />
        </div>
      </section>
    </div>
  )
}
