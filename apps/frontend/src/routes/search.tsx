import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useMovieSearch } from "@/hooks/useMovies";
import { requireAuth } from "@/lib/route-guard";
import { MOVIE_GENRES } from "@cine-connect/shared";
import { Loader2, Search } from "lucide-react";
import { GlassPanel, PosterCard, PrimaryButton } from "@/components/glass";
import { glassInputClass } from "@/lib/glass-ui";
import { cn } from "@/lib/utils";
import type { SearchResultItem } from "@/service/movies.service";

const DEBOUNCE_MS = 350;

export const Route = createFileRoute("/search")({
  beforeLoad: () => requireAuth(),
  component: SearchPage,
});

function SearchPage() {
  const [inputValue, setInputValue] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [genreId, setGenreId] = useState<number | undefined>(undefined);
  const searchKey = `${debouncedQuery}|${genreId ?? ""}`;
  const [pageByKey, setPageByKey] = useState<Record<string, number>>({});
  const page = pageByKey[searchKey] ?? 1;

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(inputValue.trim()), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [inputValue]);

  const setPage = (updater: (p: number) => number) => {
    setPageByKey((prev) => ({ ...prev, [searchKey]: updater(prev[searchKey] ?? 1) }));
  };

  const { data, isLoading, isError, error } = useMovieSearch(debouncedQuery, {
    page,
    genre: genreId,
    enabled: debouncedQuery.length > 0,
  });

  const results = data?.results ?? [];
  const totalPages = data?.total_pages ?? 0;
  const totalResults = data?.total_results ?? 0;
  const currentPage = data?.page ?? 1;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedQuery(inputValue.trim());
  };

  return (
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-ink">
            <Search className="h-7 w-7 text-accent-red" aria-hidden />
            Rechercher un film
          </h1>
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              type="search"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Titre du film…"
              className={cn(glassInputClass, "flex-1")}
              autoFocus
            />
            <select
              value={genreId ?? ""}
              onChange={(e) => setGenreId(e.target.value ? Number(e.target.value) : undefined)}
              className={cn(glassInputClass, "min-w-[180px]")}
            >
              <option value="">Tous les genres</option>
              {MOVIE_GENRES.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            <PrimaryButton type="submit" className="shrink-0 sm:self-stretch">
              Rechercher
            </PrimaryButton>
          </form>
        </div>

        {!debouncedQuery && (
          <GlassPanel className="py-12 text-center">
            <Search className="mx-auto mb-4 h-12 w-12 text-ink-muted" aria-hidden />
            <p className="text-ink-secondary">Saisissez un mot-clé pour lancer la recherche.</p>
          </GlassPanel>
        )}

        {debouncedQuery && isLoading && (
          <div className="flex flex-col items-center justify-center gap-4 py-16">
            <Loader2 className="h-10 w-10 animate-spin text-accent-red" aria-hidden />
            <p className="text-ink-secondary">Recherche en cours…</p>
          </div>
        )}

        {debouncedQuery && isError && (
          <div className="rounded-lg border border-red-800 bg-red-950/30 px-4 py-3 text-red-200">
            <p>{error instanceof Error ? error.message : "Erreur lors de la recherche."}</p>
          </div>
        )}

        {debouncedQuery && !isLoading && !isError && results.length === 0 && (
          <GlassPanel className="py-12 text-center">
            <p className="text-ink-secondary">Aucun film trouvé pour &quot;{debouncedQuery}&quot;.</p>
            <p className="mt-2 text-sm text-ink-muted">Essayez un autre terme ou un autre genre.</p>
          </GlassPanel>
        )}

        {debouncedQuery && !isLoading && !isError && results.length > 0 && (
          <>
            <p className="mb-4 text-sm text-ink-secondary">
              {totalResults} résultat{totalResults !== 1 ? "s" : ""} (page {currentPage}/{totalPages || 1})
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {results.map((m: SearchResultItem) => {
                const year = m.release_date ? new Date(m.release_date).getFullYear() : 0;
                return (
                  <Link
                    key={m.id}
                    to="/movie/$movieId"
                    params={{ movieId: String(m.id) }}
                    className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-red focus-visible:ring-offset-2 focus-visible:ring-offset-app-base"
                  >
                    <PosterCard
                      title={m.title ?? "Sans titre"}
                      posterPath={m.poster_path ?? ""}
                      year={Number.isNaN(year) ? undefined : year}
                      rating={
                        typeof m.vote_average === "number"
                          ? Math.round(m.vote_average * 10) / 10
                          : undefined
                      }
                    />
                  </Link>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-2 text-sm font-medium text-ink hover:bg-[var(--glass-bg-elevated)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Précédent
                </button>
                <span className="text-sm text-ink-secondary">
                  Page {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-2 text-sm font-medium text-ink hover:bg-[var(--glass-bg-elevated)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Suivant
                </button>
              </div>
            )}
          </>
        )}
      </main>
  );
}
