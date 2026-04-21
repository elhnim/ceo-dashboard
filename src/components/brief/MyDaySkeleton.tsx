import { Skeleton } from "@/components/ui/skeleton"

export function MyDaySkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4">
      <section className="space-y-4 rounded-[28px] border border-border/70 p-6">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-3/4" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-8 w-40" />
        </div>
      </section>
      <section className="rounded-[28px] border border-primary/20 p-6">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-4 h-8 w-full" />
        <Skeleton className="mt-2 h-8 w-5/6" />
      </section>
      {Array.from({ length: 5 }).map((_, index) => (
        <section
          key={index}
          className="space-y-3 rounded-[24px] border border-border/70 p-5"
        >
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-4/5" />
        </section>
      ))}
    </div>
  )
}
