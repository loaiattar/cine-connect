import { createFileRoute, Link } from "@tanstack/react-router";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { requireAuth } from "@/lib/route-guard";
import { Heart, Loader2, Trash2 } from "lucide-react";
import { GlassPanel, PrimaryButton } from "@/components/glass";

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
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex items-center gap-3">
          <Heart className="h-8 w-8 fill-accent-red text-accent-red" aria-hidden />
          <div>
            <h1 className="text-2xl font-bold text-ink">Mes favoris</h1>
            <p className="text-sm text-ink-secondary">{displayName}</p>
          </div>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center gap-4 py-16">
            <Loader2 className="h-10 w-10 animate-spin text-accent-red" aria-hidden />
            <p className="text-ink-secondary">Chargement de vos favoris…</p>
          </div>
        )}

        {isError && (
          <div className="rounded-lg border border-red-800 bg-red-950/30 px-4 py-3 text-red-200">
            <p>{error instanceof Error ? error.message : "Impossible de charger les favoris."}</p>
          </div>
        )}

        {!isLoading && !isError && favorites.length === 0 && (
          <GlassPanel className="py-12 text-center">
            <Heart className="mx-auto mb-4 h-12 w-12 text-ink-muted" aria-hidden />
            <p className="text-ink-secondary">Aucun film en favori pour le moment.</p>
            <PrimaryButton asChild className="mt-6">
              <Link to="/">Découvrir des films</Link>
            </PrimaryButton>
          </GlassPanel>
        )}

        {!isLoading && !isError && favorites.length > 0 && (
          <ul className="space-y-3">
            {favorites.map((fav) => (
              <li key={fav.id}>
                <GlassPanel className="flex items-center justify-between !py-3">
                <span className="text-ink-secondary">
                  Film #<span className="font-mono text-ink">{fav.externalMovieId}</span>
                </span>
                <div className="flex items-center gap-3">
                  <Link
                    to="/movie/$movieId"
                    params={{ movieId: String(fav.externalMovieId) }}
                    className="text-sm font-medium text-accent-red transition-colors hover:text-accent-red-hover"
                  >
                    Voir la fiche →
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeFavorite(fav.externalMovieId)}
                    disabled={isToggling}
                    className="rounded-lg p-1.5 text-ink-secondary transition-colors hover:bg-accent-red-ghost hover:text-accent-red-hover disabled:opacity-50"
                    title="Retirer des favoris"
                    aria-label="Retirer des favoris"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                </GlassPanel>
              </li>
            ))}
          </ul>
        )}
      </main>
  );
}

export default FavoritesPage;
