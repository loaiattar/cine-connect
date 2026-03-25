import { Link } from "@tanstack/react-router";
import { Heart, PauseCircle } from "lucide-react";

import { navLinkOutlineClass } from "@/lib/glass-ui";
import { cn, getMovieImageUrl } from "@/lib/utils";
import { CONTINUE_WATCHING_STUB, type ContinueWatchingItem } from "./continueWatchingStub";
import { GlassPanel } from "./GlassPanel";
import { PosterCard } from "./PosterCard";
import { PrimaryButton } from "./PrimaryButton";
import { ProgressBar } from "./ProgressBar";

type ContinueWatchingSectionProps = {
  items?: ContinueWatchingItem[];
};

/**
 * Milestone D.9 (issue #315): UI-only continue-watching row + mini-player tile.
 * Replace `items` with API-backed progress data when playback endpoints are available.
 */
export function ContinueWatchingRow({
  items = CONTINUE_WATCHING_STUB,
}: ContinueWatchingSectionProps) {
  if (items.length === 0) return null;

  return (
    <GlassPanel className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-accent-red" aria-hidden />
          <h2 className="text-lg font-semibold text-ink">Continue watching</h2>
        </div>
        <Link to="/watchlist" className={cn(navLinkOutlineClass, "px-3 py-1.5 text-xs")}>
          Voir la liste
        </Link>
      </div>
      <p className="text-xs text-ink-muted">
        Stub UI (#315) en attendant les données de progression depuis l&apos;API.
      </p>
      <div className="-mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-2">
        {items.map((item) => (
          <Link
            key={item.id}
            to="/movie/$movieId"
            params={{ movieId: String(item.id) }}
            className="block min-w-[190px] max-w-[220px] shrink-0 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-red focus-visible:ring-offset-2 focus-visible:ring-offset-app-base"
          >
            <div className="space-y-2">
              <PosterCard className="max-w-none" title={item.title} posterPath={item.posterPath} />
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-ink-muted">
                  <span>{item.durationLabel}</span>
                  <span>{item.progress}%</span>
                </div>
                <ProgressBar value={item.progress} label={`Progression de lecture pour ${item.title}`} />
                <p className="text-[11px] text-ink-secondary">{item.remainingLabel}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </GlassPanel>
  );
}

export function MiniPlayerTile({ items = CONTINUE_WATCHING_STUB }: ContinueWatchingSectionProps) {
  if (items.length === 0) return null;
  const miniPlayerItem = items[0];

  return (
    <GlassPanel className="space-y-4">
      <div className="flex items-center gap-2">
        <Heart className="h-5 w-5 text-accent-red" aria-hidden />
        <h2 className="text-lg font-semibold text-ink">Mini-player</h2>
      </div>
      <p className="text-xs text-ink-muted">
      </p>
      <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3">
        <div className="flex items-start gap-3">
          <img
            src={getMovieImageUrl(miniPlayerItem.posterPath, "w185")}
            alt=""
            className="h-16 w-12 shrink-0 rounded-lg object-cover"
          />
          <div className="min-w-0 flex-1 space-y-2">
            <p className="truncate text-sm font-semibold text-ink">{miniPlayerItem.title}</p>
            <div className="flex items-center justify-between text-[11px] text-ink-muted">
              <span>{miniPlayerItem.durationLabel}</span>
              <span>{miniPlayerItem.progress}%</span>
            </div>
            <ProgressBar
              value={miniPlayerItem.progress}
              label={`Progression mini-player pour ${miniPlayerItem.title}`}
            />
            <p className="text-[11px] text-ink-secondary">{miniPlayerItem.remainingLabel}</p>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <PrimaryButton
            asChild
            icon={<PauseCircle className="h-4 w-4" aria-hidden />}
            className="w-full justify-center"
          >
            <Link to="/movie/$movieId" params={{ movieId: String(miniPlayerItem.id) }}>
              Reprendre
            </Link>
          </PrimaryButton>
        </div>
      </div>
    </GlassPanel>
  );
}

export function ContinueWatchingSection(props: ContinueWatchingSectionProps) {
  return (
    <>
      <ContinueWatchingRow {...props} />
      <MiniPlayerTile {...props} />
    </>
  );
}
