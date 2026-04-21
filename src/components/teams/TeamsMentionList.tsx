import { AtSignIcon, Clock3Icon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { TeamsCacheRecord } from "@/types/teams"

type TeamsMentionListProps = {
  mentions: TeamsCacheRecord[]
}

function formatReceivedAt(value: string) {
  const receivedAt = new Date(value)

  return new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(receivedAt)
}

export function TeamsMentionList({ mentions }: TeamsMentionListProps) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="border-b border-border/60">
        <CardTitle className="flex items-center gap-2 text-lg">
          <AtSignIcon className="size-4" />
          Mentions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {mentions.length === 0 ? (
          <div className="rounded-[20px] border border-dashed border-border/70 bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
            No mentions in the last 24 hours
          </div>
        ) : (
          mentions.map((mention) => (
            <div
              key={mention.id}
              className="rounded-[20px] border border-border/70 bg-background/70 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">
                    {mention.channelName || "Direct Chat"}
                  </p>
                  {mention.actionRequired ? (
                    <Badge className="bg-amber-500 text-white hover:bg-amber-500">
                      Action Required
                    </Badge>
                  ) : null}
                </div>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock3Icon className="size-3.5" />
                  {formatReceivedAt(mention.receivedAt)}
                </p>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {mention.summary || "No preview available."}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
