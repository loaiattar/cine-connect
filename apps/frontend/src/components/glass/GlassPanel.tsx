import * as React from "react"

import { cn } from "@/lib/utils"

export type GlassPanelProps = React.ComponentProps<"div">

/**
 * Frosted panel using CinéConnectPlan §1 glass tokens (blur + thin border).
 */
export function GlassPanel({ className, children, ...props }: GlassPanelProps) {
  return (
    <div
      data-slot="glass-panel"
      className={cn(
        "rounded-[var(--radius-glass)] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4 backdrop-blur-[var(--glass-blur)] md:p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
