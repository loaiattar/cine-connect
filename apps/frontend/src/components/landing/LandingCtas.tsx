import { Link } from "@tanstack/react-router";
import { Play } from "lucide-react";

import { PrimaryButton } from "@/components/glass";
import { focusVisibleRingClass } from "@/lib/glass-ui";
import { cn } from "@/lib/utils";

type LandingCtasProps = {
  className?: string;
};

/**
 * Primary landing actions (in document flow — not fixed, so the footer stays unobstructed).
 */
export function LandingCtas({ className }: LandingCtasProps) {
  return (
    <div
      className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-3", className)}
      role="region"
      aria-label="Actions de connexion"
    >
      <p className="sr-only">
        Créez un compte ou connectez-vous pour accéder à Lumera.
      </p>
      <PrimaryButton asChild icon={<Play className="h-4 w-4" aria-hidden />} className="min-h-11 w-full justify-center sm:w-auto">
        <Link to="/register">Commencer</Link>
      </PrimaryButton>
      <Link
        to="/login"
        className={cn(
          "inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-[var(--glass-border)] bg-black/35 px-5 py-2.5 text-sm font-semibold text-ink backdrop-blur-sm transition-colors hover:border-[var(--glass-border-strong)] hover:bg-black/50 sm:w-auto",
          focusVisibleRingClass,
        )}
      >
        Se connecter
      </Link>
    </div>
  );
}
