import Link from "next/link"

import { HealthBadge } from "@/components/console/badges"
import { DecisionCard } from "@/components/console/decision-card"
import { DeliverableRow } from "@/components/console/deliverable-row"
import { OfficerStatusRow } from "@/components/console/officer-status-row"
import { AssignmentRow } from "@/components/console/assignment-row"
import {
  EmptyState,
  MetricTile,
  PageHeader,
  Section,
} from "@/components/console/primitives"
import { WorkAssignmentStatus } from "@/lib/console/domain/enums"
import { getOverview } from "@/lib/console/services/console-service"

export const dynamic = "force-dynamic"

function greeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

export default async function ConsoleHomePage() {
  const overview = await getOverview()
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
        eyebrow="Morning brief"
        title={`${greeting()}, ${overview.officers.find((o) => o.role.title === "Product Director")?.person.name ?? "Minh"}`}
        description={
          overview.latestBrief?.summary ??
          "Here is where the organization stands right now."
        }
        actions={<HealthBadge health={overview.health} />}
      />

      <Section title="At a glance">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <MetricTile label="Officers active" value={m.officersActive} href="/console/officers" />
          <MetricTile label="In progress" value={m.assignmentsInProgress} href="/console/work" />
          <MetricTile
            label="Ready for review"
            value={m.deliverablesReady}
            tone={m.deliverablesReady > 0 ? "warn" : "default"}
            href="/console/work"
          />
          <MetricTile
            label="Decisions waiting"
            value={m.decisionsWaiting}
            tone={m.decisionsWaiting > 0 ? "warn" : "default"}
            href="/console/decisions"
          />
          <MetricTile
            label="Blocked"
            value={m.blockedAssignments}
            tone={m.blockedAssignments > 0 ? "danger" : "default"}
            href="/console/work"
          />
          <MetricTile
            label="Done since brief"
            value={m.workCompletedSinceLastBrief}
            tone="good"
            href="/console/activity"
          />
        </div>
      </Section>

      <Section
        title="Needs your attention"
        description="Decisions ordered by priority."
        action={
          overview.waitingDecisions.length > 0 ? (
            <Link href="/console/decisions" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              View all
            </Link>
          ) : null
        }
      >
        {overview.waitingDecisions.length === 0 ? (
          <EmptyState
            title="Nothing needs your judgment"
            description="The Council is progressing cleanly. You'll see decisions here when they arise."
          />
        ) : (
          <div className="space-y-3">
            {overview.waitingDecisions.slice(0, 4).map((decision) => (
              <DecisionCard
                key={decision.id}
                decision={decision}
                requestedBy={name(decision.requestingOfficerAssignmentId)}
                actions={
                  <Link
                    href="/console/decisions"
                    className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    Review
                  </Link>
                }
              />
            ))}
          </div>
        )}
      </Section>

      <Section title="Ready for review" description="Completed deliverables awaiting your approval.">
        {overview.readyDeliverables.length === 0 ? (
          <EmptyState title="No deliverables waiting" />
        ) : (
          <div className="space-y-3">
            {overview.readyDeliverables.map((d) => (
              <DeliverableRow
                key={d.id}
                deliverable={d}
                authorName={name(d.authorOfficerAssignmentId)}
                href={`/console/work/${d.assignmentId}`}
              />
            ))}
          </div>
        )}
      </Section>

      <Section
        title="Officer activity"
        action={
          <Link href="/console/officers" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            View all
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

      <Section title="Continue working" description="Active work you can pick back up.">
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
    </>
  )
}
