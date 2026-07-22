import Link from "next/link"

import { ActivityList } from "@/components/console/activity-list"
import { HealthBadge } from "@/components/console/badges"
import { CommitmentRow } from "@/components/console/commitment-row"
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
import { isOverdue } from "@/lib/console/domain/logic"
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
  const mo = overview.momentum
  const now = new Date().toISOString()
  const continueWorking = overview.activeAssignments.filter(
    (a) => a.status === WorkAssignmentStatus.InProgress,
  )

  const momentumParts = [
    mo.commitmentsCompleted > 0
      ? `${mo.commitmentsCompleted} commitment${mo.commitmentsCompleted > 1 ? "s" : ""} delivered`
      : null,
    mo.commitmentsVerified > 0
      ? `${mo.commitmentsVerified} verified`
      : null,
    mo.decisionsResolved > 0
      ? `${mo.decisionsResolved} decision${mo.decisionsResolved > 1 ? "s" : ""} resolved`
      : null,
    mo.deliverablesApproved > 0
      ? `${mo.deliverablesApproved} deliverable${mo.deliverablesApproved > 1 ? "s" : ""} approved`
      : null,
    mo.workCompleted > 0 ? `${mo.workCompleted} assignments closed` : null,
  ].filter(Boolean)

  return (
    <>
      <PageHeader
        eyebrow="Executive Brief"
        title={`${greeting()}, ${overview.officers.find((o) => o.role.title === "Product Director")?.person.name ?? "Minh"}`}
        description={
          overview.latestBrief?.summary ??
          "Here is where the organization stands right now."
        }
        actions={<HealthBadge health={overview.health.health} showColorWord />}
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

      <Section
        title="Focus today"
        description="The highest-value commitments in motion — blocked and due-soon first."
        action={
          <Link
            href="/commitments"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            All commitments
          </Link>
        }
      >
        {overview.focusToday.length === 0 ? (
          <EmptyState title="No open commitments" description="Delegate an outcome to create one." />
        ) : (
          <div className="space-y-3">
            {overview.focusToday.map((c) => (
              <CommitmentRow
                key={c.id}
                commitment={c}
                ownerName={name(c.ownerOfficerAssignmentId)}
                overdue={isOverdue(c, now)}
              />
            ))}
          </div>
        )}
      </Section>

      <Section
        title="Waiting for me"
        description="Everything that needs your attention, in one list."
      >
        {overview.waitingForMe.length === 0 ? (
          <EmptyState title="Nothing is waiting on you" />
        ) : (
          <div className="space-y-2">
            {overview.waitingForMe.map((item) => (
              <Link
                key={`${item.kind}-${item.id}`}
                href={item.href}
                className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-card/40 px-4 py-3 transition-colors hover:border-border"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                </div>
                <span className="shrink-0 text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
                  {item.kind === "verification" ? "Verify" : item.kind === "decision" ? "Decide" : "Review"}
                </span>
              </Link>
            ))}
          </div>
        )}
      </Section>

      <Section title="Emerging risks" description="Deterministic signals from observable state.">
        {overview.emergingRisks.length === 0 ? (
          <EmptyState title="No emerging risks" description="Nothing overdue, blocked, or overloaded." />
        ) : (
          <div className="space-y-2">
            {overview.emergingRisks.map((risk, i) => (
              <Link
                key={`${risk.kind}-${i}`}
                href={risk.href}
                className="flex items-start gap-3 rounded-lg border border-amber-500/25 bg-amber-500/5 px-4 py-3 transition-colors hover:border-amber-500/40"
              >
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-amber-500" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{risk.title}</span>
                  <span className="block text-xs text-muted-foreground">{risk.detail}</span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </Section>

      <Section title="Momentum" description="Progress since your previous brief.">
        {momentumParts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nothing has concluded since the last brief — the organization is mid-stride.
          </p>
        ) : (
          <p className="text-sm leading-7">
            {momentumParts.join(" · ")}
            {overview.latestBrief?.highlights?.length ? (
              <span className="mt-2 block text-muted-foreground">
                {overview.latestBrief.highlights.join(" · ")}
              </span>
            ) : null}
          </p>
        )}
      </Section>

      <Section title="The organization's position">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <MetricTile
            label="Active commitments"
            value={overview.activeCommitmentCount}
            href="/commitments"
          />
          <MetricTile
            label="Completed this week"
            value={overview.completedThisWeek}
            tone="good"
            href="/commitments"
          />
          <MetricTile
            label="Decisions waiting"
            value={m.decisionsWaiting}
            tone={m.decisionsWaiting > 0 ? "warn" : "default"}
            href="/decisions"
          />
          <MetricTile
            label="Ready for review"
            value={m.deliverablesReady}
            tone={m.deliverablesReady > 0 ? "warn" : "default"}
            href="/work"
          />
          <MetricTile
            label={
              overview.maxWorkload
                ? `Heaviest workload — ${overview.maxWorkload.name}`
                : "Officer workload"
            }
            value={overview.maxWorkload?.load ?? 0}
            href="/organization"
          />
          <MetricTile
            label="Blocked"
            value={m.blockedAssignments}
            tone={m.blockedAssignments > 0 ? "danger" : "default"}
            href="/work"
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
            Full timeline
          </Link>
        }
      >
        <ActivityList events={recentActivity} />
      </Section>
    </>
  )
}
