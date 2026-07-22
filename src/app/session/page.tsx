import Link from "next/link"
import { ArrowLeftIcon, BookOpenIcon } from "lucide-react"

import { EmptyState, PageHeader, Section } from "@/components/console/primitives"
import { formatDateTime } from "@/lib/console/format"
import { getSessionAgenda } from "@/lib/console/project/service"

export const dynamic = "force-dynamic"

export default async function SessionPage() {
  const agenda = await getSessionAgenda()

  if (!agenda) {
    return (
      <>
        <PageHeader
          eyebrow="Executive session"
          title="No session is ready"
          description="The active sprint has no session-ready topic. The Executive Office will prepare the next agenda."
        />
        <EmptyState title="Nothing on the agenda" />
      </>
    )
  }

  const { topic } = agenda

  return (
    <>
      <div className="mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          Executive Office
        </Link>
      </div>

      <PageHeader
        eyebrow={agenda.sprintTitle}
        title={topic.title}
        description={
          agenda.startedAt
            ? `Session opened ${formatDateTime(agenda.startedAt)}. Everything you need is on this page — no prompt required.`
            : "Everything you need is on this page — no prompt required."
        }
      />

      <Section title="Questions for this session" description="Work through them in order; each has a recommendation waiting below.">
        <ol className="space-y-2">
          {topic.questions.map((q, i) => (
            <li key={q} className="flex items-start gap-3 rounded-lg border border-border/50 bg-card/40 px-4 py-3 text-sm leading-6">
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold tabular-nums">
                {i + 1}
              </span>
              {q}
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Supporting research" description="Prepared by the Executive Office for this topic.">
        <div className="space-y-3">
          {agenda.materials.map((r) => (
            <details key={r.id} className="group rounded-xl border border-border/60 bg-card px-4 py-3.5" open={agenda.materials.length <= 2}>
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

      <Section title="Expected deliverables">
        <ul className="space-y-2">
          {topic.expectedDeliverables.map((d) => (
            <li key={d} className="flex items-start gap-2 text-sm leading-6">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground/60" />
              {d}
            </li>
          ))}
        </ul>
      </Section>

      {topic.decision ? (
        <Section title="Executive decision framework" description="Prepared per protocol — background, options, trade-offs, recommendation, risks.">
          <div className="rounded-2xl border border-foreground/20 bg-card p-5 sm:p-6">
            <dl className="space-y-4 text-sm leading-6">
              <div>
                <dt className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">Background</dt>
                <dd className="mt-1">{topic.decision.background}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">Options</dt>
                <dd className="mt-1">
                  <ol className="list-decimal space-y-1 pl-5">
                    {topic.decision.options.map((o) => (
                      <li key={o}>{o}</li>
                    ))}
                  </ol>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">Trade-offs</dt>
                <dd className="mt-1">{topic.decision.tradeoffs}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">Recommendation</dt>
                <dd className="mt-1 font-medium">{topic.decision.recommendation}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">Risks</dt>
                <dd className="mt-1">{topic.decision.risks}</dd>
              </div>
              <div className="border-t border-border/50 pt-3">
                <dt className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">Decision required</dt>
                <dd className="mt-1 text-muted-foreground">
                  Record your direction with the Executive Office — it will produce the deliverables and
                  return them to <span className="font-medium text-foreground">Waiting for me</span> for approval.
                </dd>
              </div>
            </dl>
          </div>
        </Section>
      ) : null}
    </>
  )
}
