import { AlertTriangleIcon, CheckCheckIcon, HashIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { TeamsChannelGroup } from "@/types/teams"

type TeamsChannelFeedProps = {
  channels: TeamsChannelGroup[]
}

export function TeamsChannelFeed({ channels }: TeamsChannelFeedProps) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="border-b border-border/60">
        <CardTitle className="flex items-center gap-2 text-lg">
          <HashIcon className="size-4" />
          Channel Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {channels.length === 0 ? (
          <div className="rounded-[20px] border border-dashed border-border/70 bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
            No channel activity to show
          </div>
        ) : (
          channels.map((channel) => (
            <div
              key={`${channel.teamName || "team"}:${channel.channelId || channel.channelName}`}
              className="rounded-[20px] border border-border/70 bg-background/70 p-4"
            >
              <div className="space-y-1">
                <h3 className="font-medium">{channel.channelName}</h3>
                {channel.teamName ? (
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    {channel.teamName}
                  </p>
                ) : null}
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <AlertTriangleIcon className="size-4 text-amber-600" />
                    Issues
                  </p>
                  {channel.issues.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No issues captured.</p>
                  ) : (
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {channel.issues.map((issue, index) => (
                        <li key={`${channel.channelName}-issue-${index}`} className="flex gap-2">
                          <span className="mt-1.5 size-1.5 rounded-full bg-amber-500" />
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <CheckCheckIcon className="size-4 text-emerald-600" />
                    Decisions
                  </p>
                  {channel.decisions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No decisions captured.
                    </p>
                  ) : (
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {channel.decisions.map((decision, index) => (
                        <li
                          key={`${channel.channelName}-decision-${index}`}
                          className="flex gap-2"
                        >
                          <span className="mt-1.5 size-1.5 rounded-full bg-emerald-500" />
                          <span>{decision}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
