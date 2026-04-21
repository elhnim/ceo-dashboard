"use client"

import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { RefreshCcwIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

export function TeamsSyncButton() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleSync() {
    startTransition(() => {
      void fetch("/api/teams/sync", {
        method: "POST",
      })
        .then(async (response) => {
          const payload = (await response.json()) as {
            error?: string
            mentionCount?: number
            channelItemCount?: number
          }

          if (!response.ok) {
            throw new Error(payload.error || "Unable to sync Teams activity")
          }

          toast.success(
            `Teams synced: ${payload.mentionCount ?? 0} mentions, ${payload.channelItemCount ?? 0} channel items`,
          )
          router.refresh()
        })
        .catch((error: unknown) => {
          toast.error(
            error instanceof Error ? error.message : "Unable to sync Teams activity",
          )
        })
    })
  }

  return (
    <Button variant="outline" disabled={isPending} onClick={handleSync}>
      <RefreshCcwIcon className={isPending ? "animate-spin" : undefined} />
      {isPending ? "Syncing…" : "Manual Sync"}
    </Button>
  )
}
