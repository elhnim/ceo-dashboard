import { TeamsChannelFeed } from "@/components/teams/TeamsChannelFeed"
import { TeamsMentionList } from "@/components/teams/TeamsMentionList"
import { TeamsSyncButton } from "@/components/teams/TeamsSyncButton"
import { requireAuth } from "@/lib/auth"
import { getTeamsActivity, TeamsSchemaError } from "@/lib/services/teams"
import type { TeamsActivity } from "@/types/teams"

export default async function TeamsPage() {
  await requireAuth()

  let activity: TeamsActivity = {
    mentions: [],
    channels: [],
  }
  let loadError: string | null = null

  try {
    activity = await getTeamsActivity()
  } catch (error) {
    if (error instanceof TeamsSchemaError) {
      loadError = error.message
    } else {
      throw error
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8">
      <section className="rounded-[28px] border border-border/70 bg-gradient-to-br from-card via-card to-muted/60 p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-muted-foreground">
              Collaboration pulse
            </p>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Teams Activity
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              A read-only snapshot of recent mentions, issues, and decisions
              pulled into the briefing cache.
            </p>
          </div>
          <TeamsSyncButton />
        </div>
      </section>

      {loadError ? (
        <section className="rounded-[24px] border border-destructive/30 bg-destructive/5 px-5 py-4 text-sm text-destructive shadow-sm">
          {loadError}
        </section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <TeamsMentionList mentions={activity.mentions} />
        <TeamsChannelFeed channels={activity.channels} />
      </section>
    </div>
  )
}
