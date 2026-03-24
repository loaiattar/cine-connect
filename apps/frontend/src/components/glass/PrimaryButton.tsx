import * as React from "react"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

export type PrimaryButtonProps = React.ComponentProps<"button"> & {
  /** Renders before the label (e.g. Play icon). */
  icon?: React.ReactNode
  /** Merge styles onto child (e.g. TanStack `Link`). */
  asChild?: boolean
}

/**
 * Red glass-streaming CTA. Reserve for primary actions (watch, resume).
 */
const primaryButtonClassName = cn(
  "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors",
  "bg-accent-red hover:bg-accent-red-hover active:bg-accent-red-active",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-red focus-visible:ring-offset-2 focus-visible:ring-offset-app-base",
  "disabled:pointer-events-none disabled:opacity-50",
  "[&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0"
)

export const PrimaryButton = React.forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  function PrimaryButton(
    { className, type = "button", icon, children, asChild = false, ...props },
    ref
  ) {
    /* Slot uses React.Children.only — must be exactly one element; merge icon inside that child. */
    if (asChild) {
      const child = React.Children.only(children) as React.ReactElement<{
        children?: React.ReactNode
      }>
      const childWithIcon =
        icon != null
          ? React.cloneElement(
              child,
              undefined,
              <>
                {icon}
                {child.props.children}
              </>
            )
          : child

      return (
        <Slot.Root
          ref={ref}
          data-slot="primary-button"
          className={cn(primaryButtonClassName, className)}
          {...props}
        >
          {childWithIcon}
        </Slot.Root>
      )
    }

    return (
      <button
        ref={ref}
        type={type}
        data-slot="primary-button"
        className={cn(primaryButtonClassName, className)}
        {...props}
      >
        {icon}
        {children}
      </button>
    )
  }
)

PrimaryButton.displayName = "PrimaryButton"
