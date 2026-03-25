import { Link, createFileRoute } from "@tanstack/react-router";
import { MOVIE_GENRES } from "@cine-connect/shared";
import { Compass, Loader2, Play, Search, Sparkles } from "lucide-react";

import bgImage from "../../image/BackGround.png";
import { PublicLandingPage } from "@/components/landing/PublicLandingPage";
import { ContinueWatchingRow, GlassPanel, MiniPlayerTile, PillTag, PosterCard, PrimaryButton } from "@/components/glass";
import { useAuth } from "@/hooks/useAuth";
import { useMovieList } from "@/hooks/useMovies";
import { navLinkOutlineClass } from "@/lib/glass-ui";
import { cn, getMovieImageUrl } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: Index,
});

type TrendingItem = {
  id: number;
  title?: string;
  release_date?: string;
  poster_path?: string | null;
  vote_average?: number;
  genre_ids?: number[];
};

function getYear(value?: string): number | undefined {
  if (!value) return undefined;
  const year = new Date(value).getFullYear();
  return Number.isNaN(year) ? undefined : year;
}

function getGenreNameFromIds(ids?: number[]): string | undefined {
  if (!ids?.length) return undefined;
  const match = MOVIE_GENRES.find((g) => g.id === ids[0]);
  return match?.name;
}

function MovieRow({ title, items }: { title: string; items: TrendingItem[] }) {
  if (items.length === 0) return null;

  return (
    <GlassPanel className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-ink">{title}</h2>
        <Link to="/search" className={cn(navLinkOutlineClass, "px-3 py-1.5 text-xs")}> 
          Voir tout
        </Link>
      </div>
      <div className="-mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-2">
        {items.map((movie) => (
          <Link
            key={movie.id}
            to="/movie/$movieId"
            params={{ movieId: String(movie.id) }}
            className="block min-w-[160px] max-w-[190px] shrink-0 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-red focus-visible:ring-offset-2 focus-visible:ring-offset-app-base"
          >
            <PosterCard
              className="max-w-none"
              title={movie.title ?? "Sans titre"}
              posterPath={movie.poster_path ?? ""}
              year={getYear(movie.release_date)}
              rating={movie.vote_average}
            />
          </Link>
        ))}
      </div>
    </GlassPanel>
  );
}

function AuthenticatedHome() {
  const { data: trendingMovies, isLoading, isError, error, refetch } = useMovieList();

  const featured = trendingMovies[0];
  const trendingRow = trendingMovies.slice(0, 12);
  const topRatedRow = [...trendingMovies]
    .sort((a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0))
    .slice(0, 12);

  const heroBackdrop = featured?.poster_path
    ? getMovieImageUrl(featured.poster_path, "w780")
    : bgImage;

  return (
    <div className="min-h-full px-4 py-6 md:px-6">
      {isError && (
        <GlassPanel className="mb-6 border-red-500/40">
          <p className="text-sm text-red-300">
            {error?.message ?? "Impossible de charger les films tendance."}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 text-sm text-accent-red transition-colors hover:text-accent-red-hover"
          >
            Réessayer
          </button>
        </GlassPanel>
      )}

      <section className="relative overflow-hidden rounded-[var(--radius-glass-lg)] border border-[var(--glass-border)] bg-[var(--glass-bg)] min-h-[340px]">
        <img
          src={heroBackdrop}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/25" />

        <div className="relative z-10 flex min-h-[340px] items-end p-6 md:p-8">
          {isLoading && !featured ? (
            <div className="flex items-center gap-3 text-ink-secondary">
              <Loader2 className="h-6 w-6 animate-spin text-accent-red" aria-hidden />
              <span>Chargement des tendances…</span>
            </div>
          ) : (
            <div className="max-w-2xl space-y-4">
              <div className="flex flex-wrap gap-2">
                <PillTag variant="accent">À la une</PillTag>
                {featured?.release_date ? <PillTag>{getYear(featured.release_date)}</PillTag> : null}
                {featured?.vote_average ? (
                  <PillTag>{featured.vote_average.toFixed(1)} / 10</PillTag>
                ) : null}
                {getGenreNameFromIds(featured?.genre_ids) ? (
                  <PillTag variant="muted">{getGenreNameFromIds(featured?.genre_ids)}</PillTag>
                ) : null}
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-ink md:text-5xl">
                {featured?.title ?? "Explorez les films du moment"}
              </h1>
              <p className="max-w-xl text-sm text-ink-secondary md:text-base">
                Découvrez les nouveautés tendance, reprenez votre visionnage et trouvez
                votre prochain film en quelques secondes.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                {featured ? (
                  <PrimaryButton asChild icon={<Play className="h-4 w-4" aria-hidden />}>
                    <Link to="/movie/$movieId" params={{ movieId: String(featured.id) }}>
                      Regarder maintenant
                    </Link>
                  </PrimaryButton>
                ) : null}
                <Link to="/search" className={navLinkOutlineClass}>
                  <Search className="h-4 w-4" aria-hidden />
                  Rechercher un film
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_290px]">
        <section className="min-w-0 space-y-6">
          <MovieRow title="Trending maintenant" items={trendingRow} />
          <MovieRow title="Mieux notés en tendance" items={topRatedRow} />
          <ContinueWatchingRow />
        </section>

        <aside className="space-y-6">
          <MiniPlayerTile />
          <GlassPanel className="space-y-4">
            <div className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-accent-red" aria-hidden />
              <h2 className="text-lg font-semibold text-ink">Browse categories</h2>
            </div>
            <p className="text-sm text-ink-secondary">
              Colonne genres (stub) pour la future Discover.
            </p>
            <div className="grid grid-cols-1 gap-2">
              {MOVIE_GENRES.slice(0, 8).map((genre) => (
                <button
                  key={genre.id}
                  type="button"
                  className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2 text-left text-sm text-ink-secondary transition-colors hover:bg-[var(--glass-bg-elevated)] hover:text-ink"
                >
                  {genre.name}
                </button>
              ))}
            </div>
            <Link to="/search" className={cn(navLinkOutlineClass, "w-full justify-center")}> 
              Voir tous les genres
            </Link>
          </GlassPanel>

          <GlassPanel className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent-red" aria-hidden />
              <h3 className="text-base font-semibold text-ink">Explore more</h3>
            </div>
            <Link to="/community" className={cn(navLinkOutlineClass, "w-full justify-center")}> 
              Communauté
            </Link>
            <Link to="/chat" className={cn(navLinkOutlineClass, "w-full justify-center")}> 
              Chat global
            </Link>
          </GlassPanel>
        </aside>
      </div>
    </div>
  );
}

function Index() {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <AuthenticatedHome /> : <PublicLandingPage />;
}
