import { createFileRoute, Link } from "@tanstack/react-router";
import { useProfile } from "@/hooks/useProfile";
import { useFollow } from "@/hooks/useFollow";
import { requireAuth } from "@/lib/route-guard";
import { Loader2, User, UserPlus, UserMinus } from "lucide-react";
import { AppNavLayout } from "@/components/layout/AppNavLayout";
import { PrimaryButton } from "@/components/glass";
import { glassInputClass, navLinkOutlineClass } from "@/lib/glass-ui";
import { cn } from "@/lib/utils";
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
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <h2 className="text-lg font-semibold text-ink">Modifier le profil</h2>
      {updateError && (
        <p className="text-sm text-red-300">{updateError.message}</p>
      )}
      <div>
        <label htmlFor="profile-bio" className="mb-1 block text-sm text-ink-secondary">
          Bio
        </label>
        <textarea
          id="profile-bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className={glassInputClass}
          placeholder="Quelques mots sur vous…"
        />
      </div>
      <div>
        <label htmlFor="profile-avatar" className="mb-1 block text-sm text-ink-secondary">
          URL de l&apos;avatar
        </label>
        <input
          id="profile-avatar"
          type="url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          className={glassInputClass}
          placeholder="https://…"
        />
      </div>
      <div>
        <label htmlFor="profile-location" className="mb-1 block text-sm text-ink-secondary">
          Ville / région
        </label>
        <input
          id="profile-location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className={glassInputClass}
          placeholder="Paris"
        />
      </div>
      <div>
        <label htmlFor="profile-genre" className="mb-1 block text-sm text-ink-secondary">
          Genre préféré
        </label>
        <input
          id="profile-genre"
          type="text"
          value={favoriteGenre}
          onChange={(e) => setFavoriteGenre(e.target.value)}
          className={glassInputClass}
          placeholder="Comédie, Thriller…"
        />
      </div>
      <PrimaryButton type="submit" disabled={isUpdating}>
        {isUpdating ? "Enregistrement…" : "Enregistrer"}
      </PrimaryButton>
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
            <Loader2 className="h-10 w-10 animate-spin text-accent-red" aria-hidden />
            <p className="text-ink-secondary">Chargement du profil…</p>
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
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--glass-bg-elevated)] ring-1 ring-[var(--glass-border)]">
                  <User className="h-10 w-10 text-ink-muted" />
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-ink">{displayName}</h1>
                <p className="text-sm text-ink-secondary">{user.email}</p>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-ink-secondary">
                  {followersLoading || followingLoading ? (
                    <span>Chargement…</span>
                  ) : (
                    <>
                      <span><span className="font-semibold text-ink">{followersTotal}</span> abonnés</span>
                      <span><span className="font-semibold text-ink">{followingTotal}</span> abonnements</span>
                    </>
                  )}
                </div>
                {!isCurrentUser && profileUserId != null && (
                  <div className="mt-3">
                    {followError && (
                      <p className="mb-1 text-sm text-red-300">{followError.message}</p>
                    )}
                    {isFollowing ? (
                      <button
                        type="button"
                        onClick={() => unfollow(profileUserId)}
                        disabled={isFollowLoading}
                        className={cn(navLinkOutlineClass, "inline-flex items-center gap-2")}
                      >
                        <UserMinus className="h-4 w-4" />
                        Ne plus suivre
                      </button>
                    ) : (
                      <PrimaryButton
                        type="button"
                        onClick={() => follow(profileUserId)}
                        disabled={isFollowLoading}
                        icon={<UserPlus className="h-4 w-4" aria-hidden />}
                      >
                        Suivre
                      </PrimaryButton>
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
                <h2 className="mb-2 text-lg font-semibold text-ink">Bio</h2>
                <p className="text-ink-secondary">{profile.bio}</p>
              </div>
            )}
            {(profile?.location || profile?.favoriteGenre) && (
              <div className="flex gap-6 text-sm text-ink-secondary">
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
                            className="text-sm text-ink-secondary transition-colors hover:text-ink"
                          >
                            {u.name?.trim() || "Utilisateur"}
                          </Link>
                        </li>
                      ))}
                      {followersTotal > 10 && (
                        <li className="text-sm text-ink-muted">… et {followersTotal - 10} autres</li>
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
                            className="text-sm text-ink-secondary transition-colors hover:text-ink"
                          >
                            {u.name?.trim() || "Utilisateur"}
                          </Link>
                        </li>
                      ))}
                      {followingTotal > 10 && (
                        <li className="text-sm text-ink-muted">… et {followingTotal - 10} autres</li>
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
