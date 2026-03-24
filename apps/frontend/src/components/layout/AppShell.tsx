import type { ReactNode } from "react";

import { SidebarNav } from "./SidebarNav";

export interface AppShellProps {
  children: ReactNode;
}

/**
 * Glass v2 app frame: sidebar rail + scrollable main (CinéConnectPlan §2).
 * Below `md`, {@link SidebarNav} renders a top bar and drawer instead of the rail (issue #314).
 * Main is prepared for a future full-bleed backdrop layer (poster) behind content.
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative flex min-h-dvh bg-app-base text-ink">
      <a
        href="#main-content"
        className="absolute left-4 top-0 z-[100] -translate-y-full rounded-xl border border-[var(--glass-border-strong)] bg-[var(--glass-bg-elevated)] px-4 py-3 text-sm font-semibold text-ink shadow-lg backdrop-blur-md transition-transform focus:translate-y-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-red focus-visible:ring-offset-2 focus-visible:ring-offset-app-base"
      >
        Aller au contenu principal
      </a>
      <SidebarNav />
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        {/* Full-bleed backdrop (e.g. hero poster) — children can render into this layer later */}
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden />
        <main
          id="main-content"
          tabIndex={-1}
          className="relative z-10 flex min-h-0 min-w-0 max-w-full flex-1 flex-col overflow-y-auto overflow-x-hidden scroll-mt-4 outline-none"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
