import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useMovieSearch } from "@/hooks/useMovies";
import { requireAuth } from "@/lib/route-guard";
import { MOVIE_GENRES } from "@cine-connect/shared";
import MovieCard from "@/components/ui/CardFilm";
import { getMovieImageUrl } from "@/lib/utils";
import { Loader2, Search } from "lucide-react";
import { AppNavLayout } from "@/components/layout/AppNavLayout";
import type { SearchResultItem } from "@/service/movies.service";

const DEBOUNCE_MS = 350;

function getGenreNames(genreIds: number[] | undefined): string[] {
  if (!genreIds?.length) return [];
  const map = new Map(MOVIE_GENRES.map((g) => [g.id, g.name]));
  return genreIds.map((id) => map.get(id) ?? "").filter(Boolean);
}

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
    <AppNavLayout variant="simple">
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Search className="w-7 h-7 text-red-500" />
            Rechercher un film
          </h1>
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col sm:flex-row gap-3">
            <input
              type="search"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Titre du film…"
              className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none"
              autoFocus
            />
            <select
              value={genreId ?? ""}
              onChange={(e) => setGenreId(e.target.value ? Number(e.target.value) : undefined)}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-white focus:border-red-500 focus:outline-none min-w-[180px]"
            >
              <option value="">Tous les genres</option>
              {MOVIE_GENRES.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-lg bg-red-600 px-6 py-2.5 font-medium text-white hover:bg-red-500 transition-colors"
            >
              Rechercher
            </button>
          </form>
        </div>

        {!debouncedQuery && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-6 py-12 text-center">
            <Search className="mx-auto mb-4 h-12 w-12 text-zinc-600" />
            <p className="text-zinc-400">Saisissez un mot-clé pour lancer la recherche.</p>
          </div>
        )}

        {debouncedQuery && isLoading && (
          <div className="flex flex-col items-center justify-center gap-4 py-16">
            <Loader2 className="h-10 w-10 animate-spin text-red-500" />
            <p className="text-zinc-400">Recherche en cours…</p>
          </div>
        )}

        {debouncedQuery && isError && (
          <div className="rounded-lg border border-red-800 bg-red-950/30 px-4 py-3 text-red-200">
            <p>{error instanceof Error ? error.message : "Erreur lors de la recherche."}</p>
          </div>
        )}

        {debouncedQuery && !isLoading && !isError && results.length === 0 && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-6 py-12 text-center">
            <p className="text-zinc-400">Aucun film trouvé pour &quot;{debouncedQuery}&quot;.</p>
            <p className="mt-2 text-sm text-zinc-500">Essayez un autre terme ou un autre genre.</p>
          </div>
        )}

        {debouncedQuery && !isLoading && !isError && results.length > 0 && (
          <>
            <p className="mb-4 text-sm text-zinc-400">
              {totalResults} résultat{totalResults !== 1 ? "s" : ""} (page {currentPage}/{totalPages || 1})
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {results.map((m: SearchResultItem) => {
                const year = m.release_date ? new Date(m.release_date).getFullYear() : 0;
                return (
                  <Link
                    key={m.id}
                    to="/movie/$movieId"
                    params={{ movieId: String(m.id) }}
                    className="block focus:outline-none focus:ring-2 focus:ring-red-500 rounded-xl overflow-hidden"
                  >
                    <MovieCard
                      id={m.id}
                      title={m.title ?? "Sans titre"}
                      year={Number.isNaN(year) ? 0 : year}
                      rating={
                        typeof m.vote_average === "number"
                          ? Math.round(m.vote_average * 10) / 10
                          : 0
                      }
                      imageUrl={getMovieImageUrl(m.poster_path ?? "")}
                      genres={getGenreNames(m.genre_ids)}
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
                  className="rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>
                <span className="text-zinc-400 text-sm">
                  Page {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </AppNavLayout>
  );
}
