import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMovieBrowse, useMovieSearch } from "@/hooks/useMovies";
import { requireAuth } from "@/lib/route-guard";
import { MOVIE_GENRES } from "@cine-connect/shared";
import { Loader2, Search } from "lucide-react";
import { GlassPanel, PosterCard, PrimaryButton } from "@/components/glass";
import { glassInputClass } from "@/lib/glass-ui";
import { cn } from "@/lib/utils";
import type { SearchResultItem } from "@/service/movies.service";

function parsePositiveInt(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) return value;
  if (typeof value === "string" && /^\d+$/.test(value)) return parseInt(value, 10);
  return undefined;
}

export type SearchRouteSearch = {
  q: string;
  list?: "trending" | "top_rated";
  genre?: number;
  page: number;
};

export const Route = createFileRoute("/search")({
  validateSearch: (raw: Record<string, unknown>): SearchRouteSearch => {
    const listRaw = raw.list;
    const list =
      listRaw === "trending" || listRaw === "top_rated" ? listRaw : undefined;
    const genre = parsePositiveInt(raw.genre);
    const page = parsePositiveInt(raw.page) ?? 1;
    const q = typeof raw.q === "string" ? raw.q : "";
    return { list, genre, page, q };
  },
  beforeLoad: () => requireAuth(),
  component: SearchPage,
});

function genreLabel(id: number | undefined): string | undefined {
  if (id == null) return undefined;
  return MOVIE_GENRES.find((g) => g.id === id)?.name;
}

function SearchPage() {
  const url = Route.useSearch();
  /** Remount form state when URL-driven fields change (back/forward, home links); not when only `page` changes. */
  const formSyncKey = `${url.q}\0${url.genre ?? ""}\0${url.list ?? ""}`;
  return <SearchPageContent key={formSyncKey} url={url} />;
}

function SearchPageContent({ url }: { url: SearchRouteSearch }) {
  const navigate = useNavigate({ from: Route.fullPath });

  const [inputValue, setInputValue] = useState(url.q);
  const [genreSelect, setGenreSelect] = useState<number | undefined>(url.genre);

  const mode = useMemo(() => {
    if (url.list === "trending") return { kind: "trending" as const };
    if (url.list === "top_rated") return { kind: "top_rated" as const };
    if (url.genre != null && !url.q.trim()) return { kind: "discover" as const, genreId: url.genre };
    if (url.q.trim()) return { kind: "search" as const };
    return { kind: "empty" as const };
  }, [url.list, url.genre, url.q]);

  const page = url.page;

  const searchQuery = useMovieSearch(url.q.trim(), {
    page,
    genre: url.genre,
    enabled: mode.kind === "search",
  });

  const browseKind =
    mode.kind === "trending"
      ? "trending"
      : mode.kind === "top_rated"
        ? "top_rated"
        : mode.kind === "discover"
          ? "discover"
          : null;

  const browseQuery = useMovieBrowse(browseKind, {
    genreId: mode.kind === "discover" ? mode.genreId : undefined,
    page,
  });

  const active =
    mode.kind === "search"
      ? searchQuery
      : mode.kind === "empty"
        ? null
        : browseQuery;

  const data = active?.data;
  const isLoading = active?.isLoading ?? false;
  const isError = active?.isError ?? false;
  const error = active?.error ?? null;

  const results = data?.results ?? [];
  const totalPages = data?.total_pages ?? 0;
  const totalResults = data?.total_results ?? 0;
  const currentPage = data?.page ?? page;

  const setPage = (next: number) => {
    const p = Math.max(1, next);
    navigate({
      to: "/search",
      search: (prev) => ({ ...prev, page: p }),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed && genreSelect != null) {
      navigate({
        to: "/search",
        search: { q: "", genre: genreSelect, list: undefined, page: 1 },
      });
      return;
    }
    if (!trimmed) {
      navigate({
        to: "/search",
        search: { q: "", genre: undefined, list: undefined, page: 1 },
      });
      return;
    }
    navigate({
      to: "/search",
      search: {
        q: trimmed,
        genre: genreSelect,
        list: undefined,
        page: 1,
      },
    });
  };

  const heading = (() => {
    if (mode.kind === "trending") return "Tendance du moment";
    if (mode.kind === "top_rated") return "Mieux notés";
    if (mode.kind === "discover") {
      const name = genreLabel(mode.genreId);
      return name ? `Films — ${name}` : "Par genre";
    }
    return "Rechercher un film";
  })();

  const showEmptyHint = mode.kind === "empty";
  const showResults =
    !showEmptyHint && !isLoading && !isError && results.length > 0;
  const showNoHits =
    !showEmptyHint && !isLoading && !isError && results.length === 0;
  const showError = !showEmptyHint && isError;

  return (
    <main className="mx-auto min-h-full max-w-6xl px-4 py-6 md:px-6">
      <div className="mb-8">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-ink">
          <Search className="h-7 w-7 text-accent-red" aria-hidden />
          {heading}
        </h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <input
            type="search"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Titre du film…"
            className={cn(
              glassInputClass,
              "block w-full min-h-[3.25rem] py-3.5 text-base leading-snug md:min-h-[3.5rem] md:py-4 md:text-lg"
            )}
            autoFocus={mode.kind === "search" || mode.kind === "empty"}
            enterKeyHint="search"
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
            <select
              value={genreSelect ?? ""}
              onChange={(e) =>
                setGenreSelect(e.target.value ? Number(e.target.value) : undefined)
              }
              className={cn(glassInputClass, "min-h-[3rem] w-full sm:min-w-[14rem] sm:flex-1")}
            >
              <option value="">Tous les genres</option>
              {MOVIE_GENRES.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            <PrimaryButton
              type="submit"
              className="min-h-[3rem] w-full shrink-0 sm:w-auto sm:min-w-[10rem] sm:self-stretch"
            >
              {inputValue.trim() ? "Rechercher" : genreSelect != null ? "Voir ce genre" : "Rechercher"}
            </PrimaryButton>
          </div>
        </form>
      </div>

      {showEmptyHint && (
        <GlassPanel className="py-12 text-center">
          <Search className="mx-auto mb-4 h-12 w-12 text-ink-muted" aria-hidden />
          <p className="text-ink-secondary">
            Saisissez un mot-clé, choisissez un genre, ou ouvrez une liste depuis l&apos;accueil.
          </p>
        </GlassPanel>
      )}

      {!showEmptyHint && isLoading && (
        <GlassPanel className="flex flex-col items-center justify-center gap-4 py-16">
          <Loader2 className="h-10 w-10 animate-spin text-accent-red" aria-hidden />
          <p className="text-ink-secondary">Chargement…</p>
        </GlassPanel>
      )}

      {showError && (
        <GlassPanel className="border-red-500/40 text-red-300">
          <p>{error instanceof Error ? error.message : "Erreur lors du chargement."}</p>
        </GlassPanel>
      )}

      {showNoHits && (
        <GlassPanel className="py-12 text-center">
          <p className="text-ink-secondary">Aucun résultat pour cette sélection.</p>
          <p className="mt-2 text-sm text-ink-muted">Essayez un autre terme ou un autre genre.</p>
        </GlassPanel>
      )}

      {showResults && (
        <>
          <p className="mb-4 text-sm text-ink-secondary">
            {totalResults} résultat{totalResults !== 1 ? "s" : ""} (page {currentPage}/
            {totalPages || 1})
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
                onClick={() => setPage(currentPage - 1)}
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
                onClick={() => setPage(currentPage + 1)}
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
