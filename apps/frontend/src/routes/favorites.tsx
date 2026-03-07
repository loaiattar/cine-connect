import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { requireAuth } from "@/lib/route-guard";
import {
  moviesService,
  type FavoriteEntry,
} from "@/service/movies.service";
import { Clapperboard, Heart, Loader2 } from "lucide-react";

function normalizeFavorites(
  raw: unknown
): FavoriteEntry[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object" && "data" in raw)
    return Array.isArray((raw as { data: unknown }).data)
      ? ((raw as { data: FavoriteEntry[] }).data)
      : [];
  return [];
}

export const Route = createFileRoute("/favorites")({
  beforeLoad: () => requireAuth(),
  component: FavoritesPage,
});

function FavoritesPage() {
  const user = useAuthStore((s) => s.user);
  const userId = user?.userId;

  const {
    data: rawData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["favorites", userId],
    queryFn: () => moviesService.getFavorites(userId!),
    enabled: !!userId,
  });

  const favorites = normalizeFavorites(rawData);

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 border-b border-zinc-800/50 bg-black/90 backdrop-blur-sm px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 font-extrabold text-xl tracking-tight text-white hover:text-zinc-300 transition-colors"
          >
            <Clapperboard className="w-6 h-6 text-red-500" />
            <span>
              <span className="text-red-500">Ciné</span>
              <span className="text-orange-400">Connect</span>
            </span>
          </Link>
          <Link
            to="/"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            ← Accueil
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex items-center gap-3">
          <Heart className="h-8 w-8 text-red-500 fill-red-500" />
          <div>
            <h1 className="text-2xl font-bold text-white">Mes favoris</h1>
            <p className="text-sm text-zinc-400">
              {user?.email}
            </p>
          </div>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center gap-4 py-16">
            <Loader2 className="h-10 w-10 animate-spin text-red-500" />
            <p className="text-zinc-400">Chargement de vos favoris…</p>
          </div>
        )}

        {isError && (
          <div className="rounded-lg border border-red-800 bg-red-950/30 px-4 py-3 text-red-200">
            <p>
              {error instanceof Error ? error.message : "Impossible de charger les favoris."}
            </p>
          </div>
        )}

        {!isLoading && !isError && favorites.length === 0 && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-6 py-12 text-center">
            <Heart className="mx-auto mb-4 h-12 w-12 text-zinc-600" />
            <p className="text-zinc-400">Aucun film en favori pour le moment.</p>
            <p className="mt-2 text-sm text-zinc-500">
              Parcourez le catalogue et ajoutez des films à vos favoris.
            </p>
            <Link
              to="/"
              className="mt-6 inline-block rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-500 transition-colors"
            >
              Découvrir des films
            </Link>
          </div>
        )}

        {!isLoading && !isError && favorites.length > 0 && (
          <ul className="space-y-3">
            {favorites.map((fav) => (
              <li
                key={fav.id}
                className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3"
              >
                <span className="text-zinc-300">
                  Film #<span className="font-mono text-white">{fav.externalMovieId}</span>
                </span>
                <Link
                  to="/MovieDetailPage"
                  search={{ movieId: String(fav.externalMovieId) }}
                  className="text-sm font-medium text-red-500 hover:text-red-400 transition-colors"
                >
                  Voir la fiche →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
