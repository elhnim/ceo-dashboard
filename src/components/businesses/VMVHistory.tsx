import type { BusinessVMVHistory } from "@/types/database"
import { VMVVersionCard } from "@/components/businesses/VMVVersionCard"

type VMVHistoryProps = {
  versions: BusinessVMVHistory[]
}

export function VMVHistory({ versions }: VMVHistoryProps) {
  if (versions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-5 text-sm leading-6 text-muted-foreground">
        No archived versions yet. Once this strategic profile changes, earlier
        versions will appear here automatically.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {versions.map((version) => (
        <VMVVersionCard key={version.id} version={version} />
      ))}
    </div>
  )
}
