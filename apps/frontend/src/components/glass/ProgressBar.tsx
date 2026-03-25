import { cn } from "@/lib/utils"

export type ProgressBarProps = {
  /** 0–100; static stub until continue-watching API exists. */
  value: number
  className?: string
  trackClassName?: string
  /** Visually hidden label for assistive tech. */
  label?: string
}

/**
 * Thin progress track for “continue watching” rows.
 */
export function ProgressBar({
  value,
  className,
  trackClassName,
  label = "Progression de lecture",
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div
      data-slot="progress-bar"
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn("h-1 w-full overflow-hidden rounded-full bg-white/10", className)}
    >
      <div
        className={cn(
          "h-full rounded-full bg-accent-red transition-[width] duration-300 ease-out motion-reduce:transition-none",
          trackClassName
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
