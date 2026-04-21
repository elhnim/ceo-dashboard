interface FocusSectionProps {
  content: string
}

export function FocusSection({ content }: FocusSectionProps) {
  return (
    <section className="rounded-[28px] border-2 border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6 shadow-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
        Focus Now
      </p>
      <p className="text-xl font-semibold leading-snug text-balance md:text-2xl">
        {content}
      </p>
    </section>
  )
}
