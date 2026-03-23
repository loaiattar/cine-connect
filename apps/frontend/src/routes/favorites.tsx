import { createFileRoute, Link } from "@tanstack/react-router";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { requireAuth } from "@/lib/route-guard";
import { AppNavLayout } from "@/components/layout/AppNavLayout";
import { Heart, Loader2, Trash2 } from "lucide-react";

export const Route = createFileRoute("/favorites")({
  beforeLoad: () => requireAuth(),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { user } = useAuth();
  const { user: profileUser } = useProfile();
  const displayName = profileUser?.name ?? user?.email ?? "";
  const {
    favorites,
    isLoading,
    isError,
    error,
    removeFavorite,
    isToggling,
  } = useFavorites();

  return (
    <AppNavLayout variant="account">
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex items-center gap-3">
          <Heart className="h-8 w-8 text-red-500 fill-red-500" />
          <div>
            <h1 className="text-2xl font-bold text-white">Mes favoris</h1>
            <p className="text-sm text-zinc-400">
              {displayName}
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
            <p>{error instanceof Error ? error.message : "Impossible de charger les favoris."}</p>
          </div>
        )}

        {!isLoading && !isError && favorites.length === 0 && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-6 py-12 text-center">
            <Heart className="mx-auto mb-4 h-12 w-12 text-zinc-600" />
            <p className="text-zinc-400">Aucun film en favori pour le moment.</p>
            <Link to="/" className="mt-6 inline-block rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-500 transition-colors">
              Découvrir des films
            </Link>
          </div>
        )}

        {!isLoading && !isError && favorites.length > 0 && (
          <ul className="space-y-3">
            {favorites.map((fav) => (
              <li key={fav.id} className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3">
                <span className="text-zinc-300">
                  Film #<span className="font-mono text-white">{fav.externalMovieId}</span>
                </span>
                <div className="flex items-center gap-3">
                  <Link
                    to="/movie/$movieId"
                    params={{ movieId: String(fav.externalMovieId) }}
                    className="text-sm font-medium text-red-500 hover:text-red-400 transition-colors"
                  >
                    Voir la fiche →
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeFavorite(fav.externalMovieId)}
                    disabled={isToggling}
                    className="rounded p-1.5 text-zinc-400 hover:bg-red-950/50 hover:text-red-400 transition-colors disabled:opacity-50"
                    title="Retirer des favoris"
                    aria-label="Retirer des favoris"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </AppNavLayout>
  );
}

export default FavoritesPage;
