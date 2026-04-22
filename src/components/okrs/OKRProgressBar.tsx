import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

type OKRProgressBarProps = {
  value: number
  className?: string
}

function getProgressTone(value: number) {
  if (value < 33) {
    return "[&_[data-slot=progress-indicator]]:bg-red-500"
  }

  if (value < 66) {
    return "[&_[data-slot=progress-indicator]]:bg-amber-500"
  }

  return "[&_[data-slot=progress-indicator]]:bg-emerald-500"
}

export function OKRProgressBar({ value, className }: OKRProgressBarProps) {
  const clampedValue = Math.max(0, Math.min(100, value))

  return (
    <Progress
      value={clampedValue}
      className={cn(
        "w-full [&_[data-slot=progress-track]]:h-2 [&_[data-slot=progress-track]]:rounded-full",
        getProgressTone(clampedValue),
        className
      )}
    />
  )
}
