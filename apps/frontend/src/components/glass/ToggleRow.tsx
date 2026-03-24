import * as React from "react"
import { Switch } from "radix-ui"

import { cn } from "@/lib/utils"

export type ToggleRowProps = {
  label: string
  description?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  id?: string
  className?: string
  disabled?: boolean
}

/**
 * Watchlist / settings-style row: label + switch (use inside {@link GlassPanel}).
 */
export function ToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
  id,
  className,
  disabled,
}: ToggleRowProps) {
  const autoId = React.useId()
  const switchId = id ?? autoId

  return (
    <div
      data-slot="toggle-row"
      className={cn(
        "flex items-center justify-between gap-4 border-b border-[var(--glass-border)] py-3 last:border-b-0",
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <label htmlFor={switchId} className="text-sm font-medium text-ink">
          {label}
        </label>
        {description ? (
          <p id={`${switchId}-description`} className="mt-0.5 text-xs text-ink-secondary">
            {description}
          </p>
        ) : null}
      </div>
      <Switch.Root
        id={switchId}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        aria-describedby={description ? `${switchId}-description` : undefined}
        className={cn(
          "relative h-7 w-12 shrink-0 cursor-pointer rounded-full border border-[var(--glass-border)] bg-zinc-800 transition-colors",
          "data-[state=checked]:border-accent-red/50 data-[state=checked]:bg-accent-red",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-red focus-visible:ring-offset-2 focus-visible:ring-offset-app-base"
        )}
      >
        <Switch.Thumb
          className={cn(
            "pointer-events-none block size-6 translate-x-0.5 rounded-full bg-white shadow-md transition-transform duration-200",
            "will-change-transform data-[state=checked]:translate-x-5"
          )}
        />
      </Switch.Root>
    </div>
  )
}
