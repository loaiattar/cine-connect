import { createFileRoute, Link } from "@tanstack/react-router";
import { useProfile } from "@/hooks/useProfile";
import { useFollow } from "@/hooks/useFollow";
import { requireAuth } from "@/lib/route-guard";
import { Loader2, User, UserPlus, UserMinus } from "lucide-react";
import { AppNavLayout } from "@/components/layout/AppNavLayout";
import { useState } from "react";
import type { UserProfileRow } from "@/service/user.service";

export const Route = createFileRoute("/profile")({
  beforeLoad: () => requireAuth(),
  component: ProfilePage,
});

function ProfileEditForm({
  profile,
  onSubmit,
  isUpdating,
  updateError,
}: {
  profile: UserProfileRow | null;
  onSubmit: (data: { bio?: string; avatarUrl?: string; location?: string; favoriteGenre?: string }) => void;
  isUpdating: boolean;
  updateError: Error | null;
}) {
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl ?? "");
  const [location, setLocation] = useState(profile?.location ?? "");
  const [favoriteGenre, setFavoriteGenre] = useState(profile?.favoriteGenre ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      bio: bio || undefined,
      avatarUrl: avatarUrl || undefined,
      location: location || undefined,
      favoriteGenre: favoriteGenre || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <h2 className="text-lg font-semibold text-white">Modifier le profil</h2>
      {updateError && (
        <p className="text-sm text-red-400">{updateError.message}</p>
      )}
      <div>
        <label htmlFor="profile-bio" className="mb-1 block text-sm text-zinc-400">
          Bio
        </label>
        <textarea
          id="profile-bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none"
          placeholder="Quelques mots sur vous…"
        />
      </div>
      <div>
        <label htmlFor="profile-avatar" className="mb-1 block text-sm text-zinc-400">
          URL de l&apos;avatar
        </label>
        <input
          id="profile-avatar"
          type="url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none"
          placeholder="https://…"
        />
      </div>
      <div>
        <label htmlFor="profile-location" className="mb-1 block text-sm text-zinc-400">
          Ville / région
        </label>
        <input
          id="profile-location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none"
          placeholder="Paris"
        />
      </div>
      <div>
        <label htmlFor="profile-genre" className="mb-1 block text-sm text-zinc-400">
          Genre préféré
        </label>
        <input
          id="profile-genre"
          type="text"
          value={favoriteGenre}
          onChange={(e) => setFavoriteGenre(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none"
          placeholder="Comédie, Thriller…"
        />
      </div>
      <button
        type="submit"
        disabled={isUpdating}
        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
      >
        {isUpdating ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}

function ProfilePage() {
  const {
    user,
    profile,
    isLoading,
    isError,
    error,
    refetch,
    updateProfile,
    isUpdating,
    updateError,
    isCurrentUser,
  } = useProfile();

  const profileUserId = user?.id ?? null;
  const {
    isFollowing,
    follow,
    unfollow,
    isFollowLoading,
    followError,
    followers,
    followersTotal,
    followersLoading,
    following,
    followingTotal,
    followingLoading,
  } = useFollow(profileUserId, { fetchFollowers: true, fetchFollowing: true });

  const displayName = user?.name ?? user?.email ?? "";
  const avatarDisplay = profile?.avatarUrl ?? null;
  /** Key so the form remounts when profile loads or updates (e.g. after save), avoiding setState-in-effect */
  const profileFormKey = profile
    ? [profile.id, profile.bio, profile.avatarUrl, profile.location, profile.favoriteGenre].join("\0")
    : "none";

  return (
    <AppNavLayout variant="standard">
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
                <p className="text-sm text-zinc-400">{user.email}</p>
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
                {!isCurrentUser && profileUserId != null && (
                  <div className="mt-3">
                    {followError && (
                      <p className="text-sm text-red-400 mb-1">{followError.message}</p>
                    )}
                    {isFollowing ? (
                      <button
                        type="button"
                        onClick={() => unfollow(profileUserId)}
                        disabled={isFollowLoading}
                        className="inline-flex items-center gap-2 rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
                      >
                        <UserMinus className="h-4 w-4" />
                        Ne plus suivre
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => follow(profileUserId)}
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

            {isCurrentUser && (
              <ProfileEditForm
                key={profileFormKey}
                profile={profile}
                onSubmit={updateProfile}
                isUpdating={isUpdating}
                updateError={updateError}
              />
            )}

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

            {(followers.length > 0 || following.length > 0) && (
              <div className="grid gap-6 sm:grid-cols-2">
                {followers.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-white mb-2">Abonnés ({followersTotal})</h2>
                    <ul className="space-y-2">
                      {followers.slice(0, 10).map((u) => (
                        <li key={u.id}>
                          <Link
                            to="/profile/$userId"
                            params={{ userId: String(u.id) }}
                            className="text-sm text-zinc-300 hover:text-white transition-colors"
                          >
                            {u.name?.trim() || "Utilisateur"}
                          </Link>
                        </li>
                      ))}
                      {followersTotal > 10 && (
                        <li className="text-zinc-500 text-sm">… et {followersTotal - 10} autres</li>
                      )}
                    </ul>
                  </div>
                )}
                {following.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-white mb-2">Abonnements ({followingTotal})</h2>
                    <ul className="space-y-2">
                      {following.slice(0, 10).map((u) => (
                        <li key={u.id}>
                          <Link
                            to="/profile/$userId"
                            params={{ userId: String(u.id) }}
                            className="text-sm text-zinc-300 hover:text-white transition-colors"
                          >
                            {u.name?.trim() || "Utilisateur"}
                          </Link>
                        </li>
                      ))}
                      {followingTotal > 10 && (
                        <li className="text-zinc-500 text-sm">… et {followingTotal - 10} autres</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </AppNavLayout>
  );
}
