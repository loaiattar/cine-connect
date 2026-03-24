import type { ReactNode } from "react";

import { SidebarNav } from "./SidebarNav";

export interface AppShellProps {
  children: ReactNode;
}

/**
 * Glass v2 app frame: fixed sidebar rail + scrollable main (CinéConnectPlan §2).
 * Main is prepared for a future full-bleed backdrop layer (poster) behind content.
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-dvh bg-app-base text-ink">
      <SidebarNav />
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        {/* Full-bleed backdrop (e.g. hero poster) — children can render into this layer later */}
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden />
        <main className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
