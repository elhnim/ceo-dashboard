import Link from "next/link"
import {
  FileTextIcon,
  GaugeIcon,
  LightbulbIcon,
  SearchIcon,
} from "lucide-react"

import { PriorityBadge } from "@/components/console/badges"
import { minutes } from "@/lib/console/format"
import type { Decision } from "@/types/console"
import type { LucideIcon } from "lucide-react"

/**
 * The non-conversation panels of the Executive Assistant workspace. They
 * establish the future layout: Recommendations, Research, and Drafts show
 * sample content until real EA reasoning exists; Pending Decisions is live.
 */

function Panel({
  icon: Icon,
  title,
  hint,
  children,
}: {
  icon: LucideIcon
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border border-border/60 bg-card ring-1 ring-foreground/[0.02]">
      <header className="flex items-center gap-2.5 border-b border-border/50 px-4 py-3">
        <Icon className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">{title}</h3>
        {hint ? (
          <span className="ml-auto rounded-full border border-border/70 px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            {hint}
          </span>
        ) : null}
      </header>
      <div className="px-4 py-3.5">{children}</div>
    </section>
  )
}

function SampleRow({ title, note }: { title: string; note: string }) {
  return (
    <div className="py-2 first:pt-0 last:pb-0">
      <p className="text-sm font-medium leading-snug">{title}</p>
      <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{note}</p>
    </div>
  )
}

export function EaWorkspacePanels({
  pendingDecisions,
}: {
  pendingDecisions: Decision[]
}) {
  return (
    <div className="flex flex-col gap-4">
      <Panel icon={GaugeIcon} title="Pending decisions" hint="Live">
        {pendingDecisions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nothing is waiting on you.
          </p>
        ) : (
          <div className="divide-y divide-border/50">
            {pendingDecisions.slice(0, 4).map((d) => (
              <Link
                key={d.id}
                href="/decisions"
                className="group flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium group-hover:underline">
                    {d.title}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    {minutes(d.estimatedDecisionMinutes)}
                  </span>
                </span>
                <PriorityBadge priority={d.priority} />
              </Link>
            ))}
          </div>
        )}
      </Panel>

      <Panel icon={LightbulbIcon} title="Recommendations" hint="Sample">
        <div className="divide-y divide-border/50">
          <SampleRow
            title="Resolve the knowledge-promotion permission first"
            note="It unblocks the Organizational Mind work and takes ~8 minutes."
          />
          <SampleRow
            title="Sequence the Organization Model ahead of the Outcome Map"
            note="The Outcome Map depends on its authority structure."
          />
        </div>
        <p className="mt-3 border-t border-border/50 pt-2.5 text-xs leading-5 text-muted-foreground">
          Sample content — real recommendations arrive when EA reasoning is
          connected in a future milestone.
        </p>
      </Panel>

      <Panel icon={SearchIcon} title="Research" hint="Sample">
        <div className="divide-y divide-border/50">
          <SampleRow
            title="Outcome taxonomy comparisons"
            note="Three candidate taxonomies assessed; layered model recommended."
          />
          <SampleRow
            title="Versioning depth for the Organizational Twin"
            note="Open question from the Twin Specification v0.1 review."
          />
        </div>
        <p className="mt-3 border-t border-border/50 pt-2.5 text-xs leading-5 text-muted-foreground">
          Sample content — research briefs will be prepared by the EA in a
          future milestone.
        </p>
      </Panel>

      <Panel icon={FileTextIcon} title="Drafts" hint="Sample">
        <div className="divide-y divide-border/50">
          <SampleRow
            title="Draft: assignment for the change-propagation prototype"
            note="Prepared acceptance criteria awaiting your approval."
          />
          <SampleRow
            title="Draft: reply to the first-domain question"
            note="Position statement for locking software development first."
          />
        </div>
        <p className="mt-3 border-t border-border/50 pt-2.5 text-xs leading-5 text-muted-foreground">
          Sample content — the EA will draft assignments and replies for your
          sign-off in a future milestone.
        </p>
      </Panel>
    </div>
  )
}
