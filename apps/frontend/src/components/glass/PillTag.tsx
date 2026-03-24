import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const pillVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-full px-3 py-1 text-xs font-medium leading-none",
  {
    variants: {
      variant: {
        default:
          "border border-[var(--glass-border-strong)] bg-white/5 text-ink-secondary",
        accent:
          "border border-accent-red/40 bg-accent-red-ghost text-ink",
        muted: "bg-white/5 text-ink-muted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export type PillTagProps = React.ComponentProps<"span"> &
  VariantProps<typeof pillVariants>

/** Metadata chip (rating, duration, labels). */
export function PillTag({ className, variant, ...props }: PillTagProps) {
  return (
    <span
      data-slot="pill-tag"
      className={cn(pillVariants({ variant }), className)}
      {...props}
    />
  )
}
