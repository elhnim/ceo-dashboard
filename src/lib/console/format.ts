/** Founder Console — small, pure formatting helpers for the executive UI. */

export function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString("en-AU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/** Coarse relative time ("3h ago", "yesterday", "2d ago"). */
export function formatRelative(iso: string, from: Date = new Date()): string {
  const then = new Date(iso).getTime()
  const diffMs = from.getTime() - then
  const min = Math.round(diffMs / 60000)
  if (min < 1) return "just now"
  if (min < 60) return `${min}m ago`
  const hr = Math.round(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.round(hr / 24)
  if (day === 1) return "yesterday"
  if (day < 7) return `${day}d ago`
  return formatDate(iso)
}

export function minutes(n: number): string {
  return `~${n} min`
}
