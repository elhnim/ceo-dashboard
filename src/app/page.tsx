import Link from "next/link"
import {
  ArrowRightIcon,
  BookOpenIcon,
  CircleCheckIcon,
  GitBranchIcon,
  LandmarkIcon,
  ScrollTextIcon,
} from "lucide-react"

import { BeginSessionButton, ApprovalActions } from "@/components/console/office-actions"
import { EmptyState, PageHeader, Section } from "@/components/console/primitives"
import { formatDateTime } from "@/lib/console/format"
import { getProjectBriefing } from "@/lib/console/project/service"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

function greeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

const HEALTH_DOT = { green: "bg-emerald-500", yellow: "bg-amber-500", red: "bg-red-500" } as const
const HEALTH_WORD = { green: "Green", yellow: "Yellow", red: "Red" } as const

const APPROVAL_KIND_LABEL = {
  architecture: "Architecture approval",
  merge: "Merge approval",
  roadmap: "Roadmap decision",
  research: "Research review",
} as const

const ITEM_STATUS_LABEL = {
  planned: "Planned",
  "in-progress": "In progress",
  "in-review": "In review",
  blocked: "Blocked",
  done: "Done",
} as const

export default async function ExecutiveOfficePage() {
  const b = await getProjectBriefing()

  return (
    <>
      <PageHeader
        eyebrow="Executive Office"
        title={`${greeting()}, Minh`}
        description={b.overallStatus}
        actions={
          <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-3 py-1 text-xs font-medium">
            <span className={cn("size-2 rounded-full", HEALTH_DOT[b.health])} />
            {HEALTH_WORD[b.health]} · {b.healthReason}
          </span>
        }
      />

      {/* Executive Brief */}
      <Section title="Executive brief" className="mb-10">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <BriefCell label="Current layer" value={b.currentLayer.name.replace(/^Layer \d+ — /, "")} sub={`Layer ${b.currentLayer.id.split("-")[1]}`} />
          <BriefCell label="Current milestone" value={b.currentMilestone.title} sub={b.currentMilestone.code} />
          <BriefCell
            label="Current sprint"
            value={b.currentSprint ? b.currentSprint.title.replace(/^Architecture Sprint \d+ — /, "") : "None active"}
            sub={b.currentSprint ? b.currentSprint.title.match(/Sprint \d+/)?.[0] ?? "" : ""}
          />
          <BriefCell
            label="Milestone progress"
            value={`${b.milestoneProgress.done} of ${b.milestoneProgress.total} items done`}
            sub={b.health === "green" ? "On track" : b.healthReason}
          />
        </div>
      </Section>

      {/* Recommended Next Action */}
      <Section
        title="Recommended next action"
        description="Exactly one. Derived by the Project State Engine from approvals, sessions, and the roadmap."
        className="mb-12"
      >
        <div className="rounded-2xl border border-foreground/25 bg-card p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_10px_28px_-18px_rgba(0,0,0,0.25)] sm:p-6">
          <h3 className="text-lg font-semibold leading-snug tracking-tight sm:text-xl">
            {b.recommended.title}
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            <span className="font-medium text-foreground/80">Why now: </span>
            {b.recommended.why}
          </p>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">Executive time</dt>
              <dd className="mt-0.5 font-medium">~{b.recommended.estimatedMinutes} min</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">Expected outcome</dt>
              <dd className="mt-0.5">{b.recommended.expectedOutcome}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">Expected impact</dt>
              <dd className="mt-0.5">{b.recommended.expectedImpact}</dd>
            </div>
          </dl>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <BeginSessionButton />
            {b.recommended.source !== "session" ? (
              <Link
                href={b.recommended.href}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted"
              >
                Open the recommendation
                <ArrowRightIcon className="size-4" />
              </Link>
            ) : null}
          </div>
        </div>
      </Section>

      {/* Waiting For Me */}
      <Section
        title="Waiting for me"
        description="Executive approvals only — no engineering noise."
      >
        {b.waitingForMe.length === 0 ? (
          <EmptyState title="Nothing awaits your approval" />
        ) : (
          <div className="space-y-2">
            {b.waitingForMe.map((a) => (
              <div
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card px-4 py-3.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {APPROVAL_KIND_LABEL[a.kind]} · ~{a.estimatedMinutes} min
                  </p>
                  <p className="mt-0.5 text-sm font-medium">
                    {a.href.startsWith("http") ? (
                      <a href={a.href} className="hover:underline" target="_blank" rel="noreferrer">
                        {a.title}
                      </a>
                    ) : (
                      <Link href={a.href} className="hover:underline">
                        {a.title}
                      </Link>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{a.detail}</p>
                </div>
                <ApprovalActions approvalId={a.id} />
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Active Work */}
      <Section
        title="Active work"
        description={`${b.currentMilestone.code} — ${b.currentMilestone.objective}`}
      >
        {b.activeWork.length === 0 ? (
          <EmptyState title="The current milestone has no open items" />
        ) : (
          <div className="space-y-2">
            {b.activeWork.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/50 bg-card/40 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.owner} · est. {item.eta}
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium",
                    item.status === "blocked"
                      ? "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
                      : item.status === "in-progress"
                        ? "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400"
                        : "border-border bg-muted text-muted-foreground",
                  )}
                >
                  {ITEM_STATUS_LABEL[item.status]}
                </span>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Research Prepared */}
      <Section
        title="Research prepared"
        description="Completed research awaiting your review — supporting material for the next session."
      >
        <div className="space-y-3">
          {b.researchPrepared.map((r) => (
            <details key={r.id} className="group rounded-xl border border-border/60 bg-card px-4 py-3.5">
              <summary className="flex cursor-pointer items-center gap-3 text-sm font-medium">
                <BookOpenIcon className="size-4 shrink-0 text-muted-foreground" />
                <span className="flex-1">{r.title}</span>
                <span className="text-xs font-normal text-muted-foreground">{r.source}</span>
              </summary>
              <div className="mt-3 space-y-2 border-t border-border/50 pt-3 text-sm leading-6 text-muted-foreground">
                <p>{r.summary}</p>
                <p>
                  <span className="font-medium text-foreground/80">Why it matters here: </span>
                  {r.relevance}
                </p>
              </div>
            </details>
          ))}
        </div>
      </Section>

      {/* Engineering Status */}
      <Section title="Engineering status" description="Curated facts, refreshed each engineering cycle.">
        <div className="rounded-xl border border-border/60 bg-card px-4 py-2 sm:px-5">
          <dl className="divide-y divide-border/50 text-sm">
            <EngRow icon={<GitBranchIcon className="size-4" />} label="Branch">
              <code className="text-xs">{b.engineering.branch}</code>
            </EngRow>
            <EngRow icon={<CircleCheckIcon className="size-4" />} label="Build & tests">
              Build {b.engineering.buildStatus} · {b.engineering.tests.passing}/{b.engineering.tests.total} tests passing
            </EngRow>
            <EngRow icon={<LandmarkIcon className="size-4" />} label="Latest milestone">
              {b.engineering.latestMilestone}
            </EngRow>
            <EngRow icon={<ScrollTextIcon className="size-4" />} label="Latest ADR">
              {b.engineering.latestAdr}
            </EngRow>
            {b.engineering.openPullRequest ? (
              <EngRow icon={<GitBranchIcon className="size-4" />} label="Open pull request">
                {b.engineering.openPullRequest}
              </EngRow>
            ) : null}
          </dl>
        </div>
      </Section>

      {/* Architecture Backlog */}
      <Section title="Architecture backlog" description="Prioritized questions — engineering stays paused until these are settled.">
        <ol className="space-y-2">
          {b.architectureBacklog.map((item, i) => (
            <li
              key={item.id}
              className="flex items-start gap-3 rounded-lg border border-border/50 bg-card/40 px-4 py-3"
            >
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold tabular-nums">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs leading-5 text-muted-foreground">{item.detail}</p>
              </div>
              <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                {item.status}
              </span>
            </li>
          ))}
        </ol>
      </Section>

      {/* Product Backlog */}
      <Section title="Product backlog" description="Upcoming milestones, ordered by priority.">
        <ol className="space-y-2">
          {b.productBacklog.map((ms) => (
            <li
              key={ms.id}
              className={cn(
                "flex items-start gap-3 rounded-lg border px-4 py-3",
                ms.status === "current"
                  ? "border-foreground/20 bg-card"
                  : "border-border/50 bg-card/40",
              )}
            >
              <span className="mt-0.5 shrink-0 rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[0.65rem] font-semibold">
                {ms.code}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {ms.title}
                  {ms.status === "current" ? (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">— current</span>
                  ) : null}
                </p>
                <p className="text-xs leading-5 text-muted-foreground">{ms.objective}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {/* Executive Log */}
      <Section title="Executive log" description="Milestones approved, decisions taken, orders issued.">
        <ol className="relative space-y-0 border-l border-border/60 pl-6">
          {b.log.map((entry, i) => (
            <li key={`${entry.at}-${i}`} className="relative pb-5 last:pb-0">
              <span
                className={cn(
                  "absolute -left-[1.6rem] top-1 size-2.5 rounded-full ring-4 ring-background",
                  entry.kind === "order"
                    ? "bg-sky-500"
                    : entry.kind === "decision"
                      ? "bg-emerald-500"
                      : entry.kind === "architecture"
                        ? "bg-amber-500"
                        : "bg-muted-foreground/50",
                )}
              />
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p className="text-sm font-medium">{entry.title}</p>
                <time className="text-xs text-muted-foreground">{formatDateTime(entry.at)}</time>
              </div>
              <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">{entry.kind}</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{entry.detail}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="The organization" description="The coordination engine beneath this office.">
        <Link
          href="/brief"
          className="group flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card px-4 py-3.5 text-sm font-medium transition-colors hover:border-border"
        >
          Open the organization brief — priorities, commitments, officers, risks
          <ArrowRightIcon className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </Link>
      </Section>
    </>
  )
}

function BriefCell({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card px-4 py-4">
      <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-snug">{value}</p>
      {sub ? <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p> : null}
    </div>
  )
}

function EngRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <span className="text-muted-foreground">{icon}</span>
      <dt className="w-36 shrink-0 text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </dt>
      <dd className="min-w-0 flex-1">{children}</dd>
    </div>
  )
}
