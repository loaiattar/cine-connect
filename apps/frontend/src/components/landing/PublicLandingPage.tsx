import { useMemo } from "react";
import { Clapperboard, Loader2 } from "lucide-react";

import bgImage from "../../../image/BackGround.png";
import { LandingCtas } from "@/components/landing/LandingCtas";
import { LandingPublicFooter } from "@/components/landing/LandingPublicFooter";
import { LandingSkewPosterBackdrop } from "@/components/landing/LandingSkewPosterBackdrop";
import { useMovieList } from "@/hooks/useMovies";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

/**
 * Logged-out `/` experience (#332): TMDB poster skew field, in-flow CTAs, footer.
 * No AppShell / top navbar — matches pre-login routing in `-RootLayout.tsx`.
 */
export function PublicLandingPage() {
  const { data, isLoading, isError, error, refetch } = useMovieList();
  const reducedMotion = usePrefersReducedMotion();

  const posterPaths = useMemo(
    () => data.map((m) => m.poster_path).filter((p): p is string => Boolean(p)),
    [data],
  );

  const showSkew = posterPaths.length > 0;

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-app-base text-ink">
      {showSkew ? (
        <LandingSkewPosterBackdrop posterPaths={posterPaths} reducedMotion={reducedMotion} />
      ) : (
        <div className="pointer-events-none fixed inset-0" aria-hidden>
          <img
            src={bgImage}
            alt=""
            className="h-full w-full object-cover opacity-35"
          />
        </div>
      )}

      <div
        className="pointer-events-none fixed inset-0 bg-gradient-to-b from-black/90 via-black/78 to-black/92"
        aria-hidden
      />

      <main className="relative z-10 flex min-h-dvh flex-col pb-10">
        <section
          className="flex flex-1 flex-col items-center justify-center px-6 pb-12 pt-16 text-center md:pb-16 md:pt-20"
          aria-labelledby="landing-title"
        >
          <div
            className={cn(
              "max-w-3xl rounded-3xl border border-[var(--glass-border)] bg-black/45 px-6 py-10 shadow-2xl backdrop-blur-md md:px-10",
              "[@media(prefers-reduced-transparency:reduce)]:bg-zinc-950/92",
            )}
          >
            {isError ? (
              <div className="space-y-4 text-left">
                <p className="text-sm text-red-300">
                  {error?.message ?? "Impossible de charger les affiches pour le moment."}
                </p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="text-sm font-medium text-accent-red underline-offset-2 hover:underline"
                >
                  Réessayer
                </button>
              </div>
            ) : null}

            {isLoading && !showSkew ? (
              <div className="flex items-center justify-center gap-3 py-8 text-ink-secondary">
                <Loader2 className="h-8 w-8 animate-spin text-accent-red" aria-hidden />
                <span>Préparation de l&apos;expérience…</span>
              </div>
            ) : null}

            <h1
              id="landing-title"
              className="flex flex-wrap items-center justify-center gap-3 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
            >
              <Clapperboard className="h-10 w-10 shrink-0 text-accent-red sm:h-12 sm:w-12" aria-hidden />
              <span className="text-ink">
                <span className="text-accent-red">Lume</span>
                <span>ra</span>
              </span>
            </h1>
            <p className="mt-6 text-lg text-ink md:text-xl">
              La plateforme collaborative pour les passionnés de cinéma
            </p>
            <p className="mt-3 text-ink-secondary">
              Découvrez les tendances, notez les films et discutez en direct.
            </p>

            <LandingCtas className="mt-10" />
          </div>
        </section>

        <div className="min-h-[35vh] shrink-0" aria-hidden />
        <LandingPublicFooter />
      </main>
    </div>
  );
}
