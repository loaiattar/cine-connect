import { Link } from "@tanstack/react-router";
import { useQueries, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Bookmark, Clapperboard, Heart, Loader2, Trash2 } from "lucide-react";

import { useFavorites } from "@/hooks/useFavorites";
import { useWatchlist } from "@/hooks/useWatchlist";
import { focusVisibleRingInsetClass, navLinkOutlineClass } from "@/lib/glass-ui";
import { cn, getMovieImageUrl } from "@/lib/utils";
import { moviesService } from "@/service/movies.service";
import type { FavoriteEntry, WatchlistEntry } from "@/service/movies.service";
import { GlassPanel } from "./GlassPanel";
import { PosterCard } from "./PosterCard";
import { PrimaryButton } from "./PrimaryButton";

const MAX_ROW_ITEMS = 16;

function sortWatchlist(entries: WatchlistEntry[]): WatchlistEntry[] {
  return [...entries].sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tb - ta;
  });
}

function sortFavorites(entries: FavoriteEntry[]): FavoriteEntry[] {
  return [...entries].sort((a, b) => {
    const ta = a.addedAt ? new Date(a.addedAt).getTime() : 0;
    const tb = b.addedAt ? new Date(b.addedAt).getTime() : 0;
    return tb - ta;
  });
}

type RowItem =
  | { kind: "watchlist"; entry: WatchlistEntry }
  | { kind: "favorite"; entry: FavoriteEntry };

function sourceTabsClass(active: boolean) {
  return cn(
    "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
    focusVisibleRingInsetClass,
    active
      ? "bg-accent-red text-white"
      : "text-ink-secondary hover:bg-[var(--glass-bg-elevated)] hover:text-ink"
  );
}

/**
 * Home row: films from your **liste à voir** or **favoris** (TMDB-backed), most recently added first.
 * Remove sends the same API calls as the full list pages.
 */
export function ContinueWatchingRow() {
  const [source, setSource] = useState<"watchlist" | "favorites">("watchlist");
  const {
    watchlist,
    isLoading: wlLoading,
    isError: wlError,
    error: wlErr,
    removeFromWatchlist,
    isToggling: wlToggling,
  } = useWatchlist();
  const {
    favorites,
    isLoading: favLoading,
    isError: favError,
    error: favErr,
    removeFavorite,
    isToggling: favToggling,
  } = useFavorites();

  const rowItems = useMemo((): RowItem[] => {
    if (source === "watchlist") {
      return sortWatchlist(watchlist)
        .slice(0, MAX_ROW_ITEMS)
        .map((entry) => ({ kind: "watchlist" as const, entry }));
    }
    return sortFavorites(favorites)
      .slice(0, MAX_ROW_ITEMS)
      .map((entry) => ({ kind: "favorite" as const, entry }));
  }, [source, watchlist, favorites]);

  const movieQueries = useQueries({
    queries: rowItems.map((item) => ({
      queryKey: ["movie", item.entry.externalMovieId],
      queryFn: () => moviesService.getMovieById(item.entry.externalMovieId),
      enabled: rowItems.length > 0,
    })),
  });

  const isLoading = source === "watchlist" ? wlLoading : favLoading;
  const isError = source === "watchlist" ? wlError : favError;
  const error = source === "watchlist" ? wlErr : favErr;
  const isToggling = source === "watchlist" ? wlToggling : favToggling;

  const listLink = source === "watchlist" ? "/watchlist" : "/favorites";
  const emptyCopy =
    source === "watchlist"
      ? "Aucun film dans votre liste à voir. Ajoutez-en depuis une fiche film."
      : "Aucun favori pour le moment. Ajoutez-en depuis une fiche film.";

  return (
    <GlassPanel className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold text-ink">À reprendre</h2>
          <div
            className="flex rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-0.5"
            role="tablist"
            aria-label="Source des films"
          >
            <button
              type="button"
              role="tab"
              aria-selected={source === "watchlist"}
              onClick={() => setSource("watchlist")}
              className={sourceTabsClass(source === "watchlist")}
            >
              <span className="inline-flex items-center gap-1">
                <Bookmark className="h-3.5 w-3.5" aria-hidden />
                À voir
              </span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={source === "favorites"}
              onClick={() => setSource("favorites")}
              className={sourceTabsClass(source === "favorites")}
            >
              <span className="inline-flex items-center gap-1">
                <Heart className="h-3.5 w-3.5" aria-hidden />
                Favoris
              </span>
            </button>
          </div>
        </div>
        <Link to={listLink} className={cn(navLinkOutlineClass, "shrink-0 px-3 py-1.5 text-xs")}>
          Voir tout
        </Link>
      </div>

      <p className="text-xs text-ink-muted">
        Les films les plus récemment ajoutés apparaissent en premier. Retirer ici les enlève aussi de{" "}
        {source === "watchlist" ? "votre liste à voir" : "vos favoris"}.
      </p>

      {isLoading && (
        <div className="flex items-center gap-2 py-6 text-sm text-ink-secondary">
          <Loader2 className="h-5 w-5 animate-spin text-accent-red" aria-hidden />
          Chargement…
        </div>
      )}

      {isError && !isLoading && (
        <p className="text-sm text-red-300">
          {error instanceof Error ? error.message : "Impossible de charger la liste."}
        </p>
      )}

      {!isLoading && !isError && rowItems.length === 0 && (
        <p className="py-4 text-sm text-ink-secondary">{emptyCopy}</p>
      )}

      {!isLoading && !isError && rowItems.length > 0 && (
        <div className="-mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-2">
          {rowItems.map((item, index) => {
            const movieId = item.entry.externalMovieId;
            const query = movieQueries[index];
            const movie = query?.data;
            const movieLoading = query?.isLoading ?? true;

            const onRemove = () => {
              if (item.kind === "watchlist") {
                removeFromWatchlist(movieId);
              } else {
                removeFavorite(movieId);
              }
            };

            if (movieLoading || !movie) {
              return (
                <div
                  key={`${item.kind}-${item.entry.id}`}
                  className="relative min-w-[160px] max-w-[190px] shrink-0"
                >
                  <GlassPanel className="flex aspect-[2/3] items-center justify-center !p-0">
                    <Loader2 className="h-8 w-8 animate-spin text-ink-muted" aria-hidden />
                  </GlassPanel>
                  <button
                    type="button"
                    onClick={onRemove}
                    disabled={isToggling}
                    className="absolute right-2 top-2 z-10 rounded-lg bg-black/60 p-1.5 text-ink-secondary transition-colors hover:bg-accent-red-subtle/40 hover:text-accent-red-hover disabled:opacity-50"
                    title="Retirer"
                    aria-label="Retirer de la liste"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            }

            const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 0;

            return (
              <div
                key={`${item.kind}-${item.entry.id}`}
                className="relative min-w-[160px] max-w-[190px] shrink-0"
              >
                <Link
                  to="/movie/$movieId"
                  params={{ movieId: String(movieId) }}
                  className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-red focus-visible:ring-offset-2 focus-visible:ring-offset-app-base"
                >
                  <PosterCard
                    className="max-w-none"
                    title={movie.title ?? "Sans titre"}
                    posterPath={movie.poster_path ?? ""}
                    year={Number.isNaN(year) ? undefined : year}
                    rating={
                      typeof movie.vote_average === "number"
                        ? Math.round(movie.vote_average * 10) / 10
                        : undefined
                    }
                  />
                </Link>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onRemove();
                  }}
                  disabled={isToggling}
                  className="absolute right-2 top-2 z-10 rounded-lg bg-black/60 p-1.5 text-ink-secondary transition-colors hover:bg-accent-red-subtle/40 hover:text-accent-red-hover disabled:opacity-50"
                  title={item.kind === "watchlist" ? "Retirer de la liste à voir" : "Retirer des favoris"}
                  aria-label={
                    item.kind === "watchlist" ? "Retirer de la liste à voir" : "Retirer des favoris"
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </GlassPanel>
  );
}

/**
 * Highlights the latest **à voir** entry, or otherwise the latest **favori**.
 */
export function MiniPlayerTile() {
  const {
    watchlist,
    isLoading: wlLoading,
    removeFromWatchlist,
    isToggling: wlToggling,
  } = useWatchlist();
  const {
    favorites,
    isLoading: favLoading,
    removeFavorite,
    isToggling: favToggling,
  } = useFavorites();

  const pick = useMemo(() => {
    const wl = sortWatchlist(watchlist)[0];
    if (wl) return { kind: "watchlist" as const, entry: wl };
    const fv = sortFavorites(favorites)[0];
    if (fv) return { kind: "favorite" as const, entry: fv };
    return null;
  }, [watchlist, favorites]);

  const movieId = pick?.entry.externalMovieId ?? 0;

  const { data: movie, isLoading: movieLoading } = useQuery({
    queryKey: ["movie", movieId],
    queryFn: () => moviesService.getMovieById(movieId),
    enabled: movieId > 0,
  });

  const loading = wlLoading || favLoading || (movieId > 0 && movieLoading);
  const isToggling = pick?.kind === "watchlist" ? wlToggling : favToggling;

  const onRemove = () => {
    if (!pick) return;
    if (pick.kind === "watchlist") {
      removeFromWatchlist(pick.entry.externalMovieId);
    } else {
      removeFavorite(pick.entry.externalMovieId);
    }
  };

  return (
    <GlassPanel className="space-y-4">
      <div className="flex items-center gap-2">
        <Clapperboard className="h-5 w-5 text-accent-red" aria-hidden />
        <h2 className="text-lg font-semibold text-ink">Mini-player</h2>
      </div>
      <p className="text-xs text-ink-muted">
        Raccourci vers le dernier film ajouté à votre liste à voir (ou à vos favoris s&apos;il n&apos;y a
        rien à voir).
      </p>

      {loading && movieId > 0 && (
        <div className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-accent-red" aria-hidden />
        </div>
      )}

      {!loading && !pick && (
        <p className="text-sm text-ink-secondary">
          Ajoutez des films à votre{" "}
          <Link to="/watchlist" className="text-accent-red underline-offset-2 hover:underline">
            liste à voir
          </Link>{" "}
          ou à vos{" "}
          <Link to="/favorites" className="text-accent-red underline-offset-2 hover:underline">
            favoris
          </Link>
          .
        </p>
      )}

      {!loading && pick && !movie && (
        <div className="flex flex-col gap-2 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3">
          <p className="text-sm text-ink-secondary">Détails du film indisponibles.</p>
          <PrimaryButton asChild className="w-full justify-center">
            <Link to="/movie/$movieId" params={{ movieId: String(movieId) }}>
              Ouvrir la fiche
            </Link>
          </PrimaryButton>
          <button
            type="button"
            onClick={onRemove}
            disabled={isToggling}
            className="text-xs text-ink-muted underline hover:text-ink"
          >
            Retirer de la liste
          </button>
        </div>
      )}

      {!loading && pick && movie && (
        <div className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3">
          <div className="flex items-start gap-3">
            <img
              src={getMovieImageUrl(movie.poster_path ?? "", "w185")}
              alt=""
              className="h-16 w-12 shrink-0 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1 space-y-1">
              <p className="truncate text-sm font-semibold text-ink">{movie.title ?? "Sans titre"}</p>
              <p className="text-[11px] text-ink-muted">
                {pick.kind === "watchlist" ? "Liste à voir" : "Favoris"}
              </p>
            </div>
            <button
              type="button"
              onClick={onRemove}
              disabled={isToggling}
              className="shrink-0 rounded-lg bg-black/40 p-1.5 text-ink-secondary hover:bg-accent-red-subtle/40 hover:text-accent-red-hover disabled:opacity-50"
              title="Retirer"
              aria-label="Retirer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 flex gap-2">
            <PrimaryButton asChild className="w-full justify-center">
              <Link to="/movie/$movieId" params={{ movieId: String(movieId) }}>
                Ouvrir la fiche
              </Link>
            </PrimaryButton>
          </div>
        </div>
      )}
    </GlassPanel>
  );
}

export function ContinueWatchingSection() {
  return (
    <>
      <ContinueWatchingRow />
      <MiniPlayerTile />
    </>
  );
}
