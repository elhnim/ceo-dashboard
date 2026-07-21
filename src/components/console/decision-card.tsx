import type { ReactNode } from "react"

import { PriorityBadge, TypeBadge } from "@/components/console/badges"
import { minutes } from "@/lib/console/format"
import type { Decision } from "@/types/console"

export function DecisionCard({
  decision,
  requestedBy,
  actions,
  expanded = false,
}: {
  decision: Decision
  requestedBy: string
  actions?: ReactNode
  expanded?: boolean
}) {
  return (
    <article className="rounded-xl border border-border/60 bg-card p-4 ring-1 ring-foreground/[0.02] sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <PriorityBadge priority={decision.priority} />
        <TypeBadge type={decision.type} />
        <span className="text-xs text-muted-foreground">{minutes(decision.estimatedDecisionMinutes)}</span>
      </div>
      <h3 className="mt-3 text-base font-semibold tracking-tight">{decision.title}</h3>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{decision.whyItMatters}</p>

      {expanded ? (
        <div className="mt-4 space-y-4 border-t border-border/50 pt-4 text-sm leading-6">
          <Detail label="Context">{decision.context}</Detail>
          <Detail label="Recommendation">
            <span className="font-medium text-foreground">{decision.recommendation}</span>
          </Detail>
          {decision.alternatives.length > 0 ? (
            <Detail label="Alternatives">
              <ul className="space-y-1">
                {decision.alternatives.map((alt) => (
                  <li key={alt.title}>
                    <span className="font-medium text-foreground">{alt.title}</span>
                    {" — "}
                    <span className="text-muted-foreground">{alt.description}</span>
                  </li>
                ))}
              </ul>
            </Detail>
          ) : null}
          <Detail label="Expected impact">{decision.expectedImpact}</Detail>
          {decision.supportingEvidence.length > 0 ? (
            <Detail label="Evidence">
              <div className="flex flex-wrap gap-2">
                {decision.supportingEvidence.map((e) => (
                  <span
                    key={e.label}
                    className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-muted/40 px-2 py-0.5 text-xs text-muted-foreground"
                  >
                    {e.label}
                    <span className="text-[0.65rem] uppercase tracking-wide opacity-70">{e.kind}</span>
                  </span>
                ))}
              </div>
            </Detail>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">Requested by {requestedBy}</p>
        {actions}
      </div>
    </article>
  )
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[8rem_1fr] sm:gap-4">
      <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">{label}</p>
      <div>{children}</div>
    </div>
  )
}
