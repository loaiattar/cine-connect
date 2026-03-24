/** Shared class strings for Glass v2 surfaces (CinéConnectPlan §1). */

/**
 * Visible keyboard focus (replaces default outline). Use on links/buttons in main content.
 * CinéConnectPlan §8 / issue #313.
 */
export const focusVisibleRingClass =
  "outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-red focus-visible:ring-offset-2 focus-visible:ring-offset-app-base";

/**
 * Inset focus ring — use in sidebars or `overflow` containers so rings are not clipped.
 * Issue #313.
 */
export const focusVisibleRingInsetClass =
  "outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-red";

export const glassInputClass =
  "w-full rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-2.5 text-ink placeholder:text-ink-muted transition-[border-color,box-shadow] focus:border-accent-red focus:outline-none focus:ring-1 focus:ring-accent-red/30 focus-visible:ring-2 focus-visible:ring-accent-red/50 disabled:opacity-50";

export const glassHeaderClass =
  "sticky top-0 z-50 border-b border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)]";

export const navLinkOutlineClass = [
  "inline-flex items-center gap-1.5 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-2 text-sm font-medium text-ink-secondary transition-colors hover:border-[var(--glass-border-strong)] hover:bg-[var(--glass-bg-elevated)] hover:text-ink",
  focusVisibleRingClass,
].join(" ");
