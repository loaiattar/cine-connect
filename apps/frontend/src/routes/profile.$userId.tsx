import { createFileRoute, Link } from "@tanstack/react-router";
import { useProfile } from "@/hooks/useProfile";
import { useFollow } from "@/hooks/useFollow";
import type { FollowUserRow } from "@/service/follow.service";
import { Clapperboard, Loader2, User, UserPlus, UserMinus } from "lucide-react";
import { useState } from "react";

type ProfileConnectionsTab = "followers" | "following";

function FollowListRow({ user: u }: { user: FollowUserRow }) {
  const label = u.name?.trim() || "Utilisateur";
  const avatar = u.avatarUrl?.trim() || null;
  return (
    <li>
      <Link
        to="/profile/$userId"
        params={{ userId: String(u.id) }}
        className="flex items-center gap-3 rounded-lg px-2 py-2 text-zinc-300 transition-colors hover:bg-zinc-800/60 hover:text-white"
      >
        {avatar ? (
          <img src={avatar} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-800">
            <User className="h-5 w-5 text-zinc-500" />
          </div>
        )}
        <span className="min-w-0 truncate text-sm font-medium">{label}</span>
      </Link>
    </li>
  );
}

export const Route = createFileRoute("/profile/$userId")({
  component: UserProfilePage,
});

function UserProfilePage() {
  const { userId: userIdParam } = Route.useParams();
  const userId = parseInt(userIdParam, 10);
  const isValidId = Number.isInteger(userId) && userId > 0;

  const {
    user,
    profile,
    stats,
    isFollowingFromApi,
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

  const [connectionsTab, setConnectionsTab] = useState<ProfileConnectionsTab>("followers");

  const displayName = user?.name ?? "Utilisateur";
  const avatarDisplay = profile?.avatarUrl ?? null;
  const followersCountDisplay = stats?.followersCount ?? followersTotal;
  const followingCountDisplay = stats?.followingCount ?? followingTotal;
  const countsLoading =
    stats == null && (followersLoading || followingLoading);
  const showFollowing =
    isFollowingFromApi !== undefined ? isFollowingFromApi : isFollowing;

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
                  {countsLoading ? (
                    <span>Chargement…</span>
                  ) : (
                    <>
                      <span><span className="font-semibold text-white">{followersCountDisplay}</span> abonnés</span>
                      <span><span className="font-semibold text-white">{followingCountDisplay}</span> abonnements</span>
                    </>
                  )}
                </div>
                {!isCurrentUser && (
                  <div className="mt-3">
                    {followError && (
                      <p className="text-sm text-red-400 mb-1">{followError.message}</p>
                    )}
                    {showFollowing ? (
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

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
              <div className="flex border-b border-zinc-800">
                <button
                  type="button"
                  role="tab"
                  aria-selected={connectionsTab === "followers"}
                  onClick={() => setConnectionsTab("followers")}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    connectionsTab === "followers"
                      ? "bg-zinc-800/80 text-white border-b-2 border-b-red-500 -mb-px"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Followers
                  <span className="ml-1.5 tabular-nums text-zinc-500">({followersCountDisplay})</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={connectionsTab === "following"}
                  onClick={() => setConnectionsTab("following")}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    connectionsTab === "following"
                      ? "bg-zinc-800/80 text-white border-b-2 border-b-red-500 -mb-px"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Following
                  <span className="ml-1.5 tabular-nums text-zinc-500">({followingCountDisplay})</span>
                </button>
              </div>

              <div className="p-4 min-h-[120px]" role="tabpanel">
                {connectionsTab === "followers" && (
                  <>
                    {followersLoading && (
                      <div className="flex flex-col items-center justify-center gap-2 py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
                        <p className="text-sm text-zinc-500">Chargement des abonnés…</p>
                      </div>
                    )}
                    {!followersLoading && followersError && (
                      <div className="rounded-lg border border-red-900/50 bg-red-950/20 px-3 py-2 text-sm text-red-200">
                        <p>{followersError.message}</p>
                        <button
                          type="button"
                          onClick={() => refetchFollowers()}
                          className="mt-2 text-xs underline hover:no-underline"
                        >
                          Réessayer
                        </button>
                      </div>
                    )}
                    {!followersLoading && !followersError && followers.length === 0 && (
                      <p className="py-8 text-center text-sm text-zinc-500">Aucun abonné pour le moment.</p>
                    )}
                    {!followersLoading && !followersError && followers.length > 0 && (
                      <>
                        <ul className="space-y-0.5">
                          {followers.map((u) => (
                            <FollowListRow key={u.id} user={u} />
                          ))}
                        </ul>
                        {followersCountDisplay > followers.length && (
                          <p className="mt-3 text-center text-xs text-zinc-500">
                            {followers.length} sur {followersCountDisplay} affichés
                          </p>
                        )}
                      </>
                    )}
                  </>
                )}

                {connectionsTab === "following" && (
                  <>
                    {followingLoading && (
                      <div className="flex flex-col items-center justify-center gap-2 py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
                        <p className="text-sm text-zinc-500">Chargement des abonnements…</p>
                      </div>
                    )}
                    {!followingLoading && followingError && (
                      <div className="rounded-lg border border-red-900/50 bg-red-950/20 px-3 py-2 text-sm text-red-200">
                        <p>{followingError.message}</p>
                        <button
                          type="button"
                          onClick={() => refetchFollowing()}
                          className="mt-2 text-xs underline hover:no-underline"
                        >
                          Réessayer
                        </button>
                      </div>
                    )}
                    {!followingLoading && !followingError && following.length === 0 && (
                      <p className="py-8 text-center text-sm text-zinc-500">
                        Ne suit personne pour le moment.
                      </p>
                    )}
                    {!followingLoading && !followingError && following.length > 0 && (
                      <>
                        <ul className="space-y-0.5">
                          {following.map((u) => (
                            <FollowListRow key={u.id} user={u} />
                          ))}
                        </ul>
                        {followingCountDisplay > following.length && (
                          <p className="mt-3 text-center text-xs text-zinc-500">
                            {following.length} sur {followingCountDisplay} affichés
                          </p>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
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
