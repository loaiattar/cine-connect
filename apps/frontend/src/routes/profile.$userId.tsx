import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useFollow } from "@/hooks/useFollow";
import { Clapperboard, Loader2, User, UserPlus, UserMinus } from "lucide-react";

export const Route = createFileRoute("/profile/$userId")({
  component: UserProfilePage,
});

//──Petits composants locaux ─────────────────────────────────────────────────

interface UserRow {
  id: number;
  name?: string | null;
  email?: string | null;
}

function UserListItem({ user }: { user: UserRow }) {
  return (
    <Link
      to="/profile/$userId"
      params={{ userId: String(user.id) }}
      className="flex items-center gap-3 hover:bg-zinc-900 rounded-lg px-2 py-1.5 transition-colors"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-sm font-semibold text-white uppercase">
        {user.name ? user.name.charAt(0) : <User className="h-4 w-4 text-zinc-500" />}
      </div>
      <span className="text-sm text-zinc-300">{user.name || user.email}</span>
    </Link>
  );
}

function TabContent({
  isLoading,
  error,
  onRetry,
  emptyMessage,
  loadingMessage,
  users,
}: {
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  emptyMessage: string;
  loadingMessage: string;
  users: UserRow[];
}) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-6 text-zinc-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm">{loadingMessage}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-800 bg-red-950/30 px-4 py-3 text-red-200">
        <p className="text-sm">{error.message}</p>
        <button type="button" onClick={onRetry} className="mt-2 text-sm underline hover:no-underline">
          Réessayer
        </button>
      </div>
    );
  }

  if (users.length === 0) {
    return <p className="py-6 text-center text-sm text-zinc-500">{emptyMessage}</p>;
  }

  return (
    <ul className="space-y-3">
      {users.map((u) => (
        <li key={u.id}>
          <UserListItem user={u} />
        </li>
      ))}
    </ul>
  );
}

function UserProfilePage() {
  const { userId: userIdParam } = Route.useParams();
  const userId = parseInt(userIdParam, 10);
  const [activeTab, setActiveTab] = useState<"followers" | "following">("followers");
  const isValidId = Number.isInteger(userId) && userId > 0;

  const {
    user,
    profile,
    isLoading,
    isError,
    error,
    refetch,
    isCurrentUser,
  } = useProfile(isValidId ? userId : null);

  const {
    isFollowing,
    follow,
    unfollow,
    isFollowLoading,
    followError,
    followers,
    followersTotal,
    followersLoading,
    followersError,
    refetchFollowers,
    following,
    followingTotal,
    followingLoading,
    followingError,
    refetchFollowing,
  } = useFollow(isValidId ? userId : null, { fetchFollowers: true, fetchFollowing: true });

  const displayName = user?.name ?? "Utilisateur";
  const avatarDisplay = profile?.avatarUrl ?? null;

  if (!isValidId) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-red-400">Profil invalide.</p>
        <Link to="/" className="text-sm text-zinc-400 hover:text-white transition-colors">
          ← Accueil
        </Link>
      </div>
    );
  }

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
          <Link to="/" className="text-sm text-zinc-400 hover:text-white transition-colors">
            ← Accueil
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        {isLoading && (
          <div className="flex flex-col items-center justify-center gap-4 py-16">
            <Loader2 className="h-10 w-10 animate-spin text-red-500" />
            <p className="text-zinc-400">Chargement du profil…</p>
          </div>
        )}

        {isError && (
          <div className="rounded-lg border border-red-800 bg-red-950/30 px-4 py-3 text-red-200">
            <p>{error instanceof Error ? error.message : "Impossible de charger le profil."}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-2 text-sm underline hover:no-underline"
            >
              Réessayer
            </button>
          </div>
        )}

        {!isLoading && !isError && user && (
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              {avatarDisplay ? (
                <img
                  src={avatarDisplay}
                  alt=""
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-800">
                  <User className="h-10 w-10 text-zinc-500" />
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white">{displayName}</h1>
                {user.email != null && user.email !== "" && (
                  <p className="text-sm text-zinc-400">{user.email}</p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-zinc-400">
                  {followersLoading || followingLoading ? (
                    <span>Chargement…</span>
                  ) : (
                    <>
                      <span><span className="font-semibold text-white">{followersTotal}</span> abonnés</span>
                      <span><span className="font-semibold text-white">{followingTotal}</span> abonnements</span>
                    </>
                  )}
                </div>
                {!isCurrentUser && (
                  <div className="mt-3">
                    {followError && (
                      <p className="text-sm text-red-400 mb-1">{followError.message}</p>
                    )}
                    {isFollowing ? (
                      <button
                        type="button"
                        onClick={() => unfollow(userId)}
                        disabled={isFollowLoading}
                        className="inline-flex items-center gap-2 rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
                      >
                        <UserMinus className="h-4 w-4" />
                        Ne plus suivre
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => follow(userId)}
                        disabled={isFollowLoading}
                        className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
                      >
                        <UserPlus className="h-4 w-4" />
                        Suivre
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {profile?.bio && (
              <div>
                <h2 className="text-lg font-semibold text-white mb-2">Bio</h2>
                <p className="text-zinc-300">{profile.bio}</p>
              </div>
            )}
            {(profile?.location || profile?.favoriteGenre) && (
              <div className="flex gap-6 text-sm text-zinc-400">
                {profile?.location && <span>Ville: <br /> {profile.location}</span>}
                {profile?.favoriteGenre && <span>Genre préféré: {profile.favoriteGenre}</span>}
              </div>
            )}

            <div>
              <div className="flex border-b border-zinc-800 mb-4">
                <button
                  type="button"
                  onClick={() => setActiveTab("followers")}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === "followers"
                      ? "border-b-2 border-red-500 text-white"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Abonnés ({followersTotal})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("following")}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === "following"
                      ? "border-b-2 border-red-500 text-white"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Abonnements ({followingTotal})
                </button>
              </div>

              {activeTab === "followers" && (
                <TabContent
                  isLoading={followersLoading}
                  error={followersError}
                  onRetry={refetchFollowers}
                  loadingMessage="Chargement des abonnés…"
                  emptyMessage="Aucun abonné pour l'instant."
                  users={followers}
                />
              )}

              {activeTab === "following" && (
                <TabContent
                  isLoading={followingLoading}
                  error={followingError}
                  onRetry={refetchFollowing}
                  loadingMessage="Chargement des abonnements…"
                  emptyMessage="Ne suit personne pour l'instant."
                  users={following}
                />
              )}
            </div>
          </div>
        )}

        {!isLoading && !isError && !user && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-6 py-12 text-center">
            <p className="text-zinc-400">Ce profil n’existe pas ou a été supprimé.</p>
            <Link to="/" className="mt-4 inline-block text-sm text-red-500 hover:text-red-400">
              ← Retour à l’accueil
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
