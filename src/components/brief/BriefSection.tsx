import type { ReactNode } from "react"

interface BriefSectionProps {
  title: string
  content: string
  format: "narrative" | "structured"
  icon: ReactNode
  enabled: boolean
}

export function BriefSection({
  title,
  content,
  format,
  icon,
  enabled,
}: BriefSectionProps) {
  if (!enabled || !content.trim()) {
    return null
  }

  return (
    <section className="space-y-3 rounded-[24px] border border-border/70 bg-card/90 p-5 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        {icon}
        <span>{title}</span>
      </div>
      {format === "narrative" ? (
        <p className="text-sm leading-7 text-foreground/90">{content}</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {content
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line, index) => (
              <li key={`${title}-${index}`} className="flex gap-2 leading-6">
                <span className="text-muted-foreground">•</span>
                <span>{line.replace(/^[•\-]\s*/, "")}</span>
              </li>
            ))}
        </ul>
      )}
    </section>
  )
}
