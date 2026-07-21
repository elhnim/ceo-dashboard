import Link from "next/link"

import { ActivityList } from "@/components/console/activity-list"
import { HealthBadge } from "@/components/console/badges"
import { DeliverableRow } from "@/components/console/deliverable-row"
import { OfficerStatusRow } from "@/components/console/officer-status-row"
import { AssignmentRow } from "@/components/console/assignment-row"
import { TodayPriorities } from "@/components/console/today-priorities"
import {
  EmptyState,
  MetricTile,
  PageHeader,
  Section,
} from "@/components/console/primitives"
import { WorkAssignmentStatus } from "@/lib/console/domain/enums"
import { getActivity, getOverview } from "@/lib/console/services/console-service"

export const dynamic = "force-dynamic"

function greeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

export default async function ExecutiveBriefPage() {
  const [overview, recentActivity] = await Promise.all([
    getOverview(),
    getActivity(5),
  ])
  const officerName = new Map(
    overview.officers.map((o) => [o.officerAssignment.id, o.person.name]),
  )
  const name = (id: string) => officerName.get(id) ?? "an officer"

  const m = overview.metrics
  const continueWorking = overview.activeAssignments.filter(
    (a) => a.status === WorkAssignmentStatus.InProgress,
  )

  return (
    <>
      <PageHeader
        eyebrow="Executive Brief"
        title={`${greeting()}, ${overview.officers.find((o) => o.role.title === "Product Director")?.person.name ?? "Minh"}`}
        description={
          overview.latestBrief?.summary ??
          "Here is where the organization stands right now."
        }
        actions={<HealthBadge health={overview.health} />}
      />

      <Section
        title="Today's priorities"
        description="If you only have 30 minutes today, spend them here — ranked by urgency and impact."
        className="mb-12"
        action={
          overview.waitingDecisions.length > 0 ? (
            <Link
              href="/decisions"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              All decisions ({overview.waitingDecisions.length})
            </Link>
          ) : null
        }
      >
        <TodayPriorities items={overview.todaysPriorities} />
      </Section>

      {overview.latestBrief &&
      (overview.latestBrief.highlights.length > 0 ||
        overview.latestBrief.risks.length > 0) ? (
        <Section title="Since your last brief">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border/60 bg-card px-4 py-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Moved forward
              </p>
              {overview.latestBrief.highlights.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nothing recorded.</p>
              ) : (
                <ul className="space-y-1.5 text-sm leading-6 text-muted-foreground">
                  {overview.latestBrief.highlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              )}
            </div>
            <div className="rounded-xl border border-border/60 bg-card px-4 py-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Risks
              </p>
              {overview.latestBrief.risks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No open risks.</p>
              ) : (
                <ul className="space-y-1.5 text-sm leading-6 text-muted-foreground">
                  {overview.latestBrief.risks.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Section>
      ) : null}

      <Section title="The organization's position">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <MetricTile label="Officers active" value={m.officersActive} href="/organization" />
          <MetricTile label="In progress" value={m.assignmentsInProgress} href="/work" />
          <MetricTile
            label="Ready for review"
            value={m.deliverablesReady}
            tone={m.deliverablesReady > 0 ? "warn" : "default"}
            href="/work"
          />
          <MetricTile
            label="Decisions waiting"
            value={m.decisionsWaiting}
            tone={m.decisionsWaiting > 0 ? "warn" : "default"}
            href="/decisions"
          />
          <MetricTile
            label="Blocked"
            value={m.blockedAssignments}
            tone={m.blockedAssignments > 0 ? "danger" : "default"}
            href="/work"
          />
          <MetricTile
            label="Done since brief"
            value={m.workCompletedSinceLastBrief}
            tone="good"
            href="/knowledge"
          />
        </div>
      </Section>

      <Section
        title="Ready for review"
        description="Completed deliverables awaiting your approval."
      >
        {overview.readyDeliverables.length === 0 ? (
          <EmptyState title="No deliverables waiting" />
        ) : (
          <div className="space-y-3">
            {overview.readyDeliverables.map((d) => (
              <DeliverableRow
                key={d.id}
                deliverable={d}
                authorName={name(d.authorOfficerAssignmentId)}
                href={`/work/${d.assignmentId}`}
              />
            ))}
          </div>
        )}
      </Section>

      <Section
        title="Officer updates"
        action={
          <Link
            href="/organization"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Full organization
          </Link>
        }
      >
        <div className="space-y-3">
          {overview.officers
            .filter((o) => o.role.title !== "Product Director")
            .map((summary) => (
              <OfficerStatusRow key={summary.officerAssignment.id} summary={summary} />
            ))}
        </div>
      </Section>

      <Section title="Continue working" description="Commitments in motion you can pick back up.">
        {continueWorking.length === 0 ? (
          <EmptyState title="Nothing in progress right now" />
        ) : (
          <div className="space-y-3">
            {continueWorking.map((a) => (
              <AssignmentRow
                key={a.id}
                assignment={a}
                ownerName={name(a.ownerOfficerAssignmentId)}
              />
            ))}
          </div>
        )}
      </Section>

      <Section
        title="Latest activity"
        action={
          <Link
            href="/knowledge"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Full record
          </Link>
        }
      >
        <ActivityList events={recentActivity} />
      </Section>
    </>
  )
}
