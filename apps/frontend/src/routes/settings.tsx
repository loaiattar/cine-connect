import { createFileRoute, Link } from "@tanstack/react-router";
import { requireAuth } from "@/lib/route-guard";
import { useProfile } from "@/hooks/useProfile";
import { GlassPanel, PrimaryButton } from "@/components/glass";
import { glassInputClass } from "@/lib/glass-ui";
import { Loader2, Lock, Mail, Trash2, Upload, UserCog } from "lucide-react";
import { useRef, useState } from "react";
import type { UserProfileRow } from "@/service/user.service";
import { useAuthStore } from "@/stores/auth.store";

export const Route = createFileRoute("/settings")({
  beforeLoad: () => requireAuth(),
  component: SettingsPage,
});

function ProfileSettingsForm({
  profile,
  onSubmit,
  onUploadAvatar,
  isUpdating,
  isUploadingAvatar,
  updateError,
  uploadAvatarError,
}: {
  profile: UserProfileRow | null;
  onSubmit: (data: { bio?: string; avatarUrl?: string; location?: string; favoriteGenre?: string }) => void;
  onUploadAvatar: (file: File) => void;
  isUpdating: boolean;
  isUploadingAvatar: boolean;
  updateError: Error | null;
  uploadAvatarError: Error | null;
}) {
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl ?? "");
  const [location, setLocation] = useState(profile?.location ?? "");
  const [favoriteGenre, setFavoriteGenre] = useState(profile?.favoriteGenre ?? "");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold text-ink">Profil public / apparence</h2>
      {updateError && <p className="text-sm text-red-300">{updateError.message}</p>}
      {uploadAvatarError && <p className="text-sm text-red-300">{uploadAvatarError.message}</p>}
      <div className="space-y-2 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg-elevated)] p-3">
        <label htmlFor="settings-avatar-file" className="block text-sm text-ink-secondary">
          Photo de profil (upload depuis votre PC)
        </label>
        <input
          id="settings-avatar-file"
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            onUploadAvatar(file);
            e.currentTarget.value = "";
          }}
        />
        <PrimaryButton
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploadingAvatar}
          icon={<Upload aria-hidden />}
        >
          {isUploadingAvatar ? "Upload..." : "Choisir une image"}
        </PrimaryButton>
      </div>
      <div>
        <label htmlFor="settings-bio" className="mb-1 block text-sm text-ink-secondary">
          Bio
        </label>
        <textarea
          id="settings-bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className={glassInputClass}
          placeholder="Quelques mots sur vous…"
        />
      </div>
      <div>
        <label htmlFor="settings-avatar" className="mb-1 block text-sm text-ink-secondary">
          Lien de l&apos;avatar (optionnel)
        </label>
        <input
          id="settings-avatar"
          type="text"
          autoComplete="off"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          className={glassInputClass}
          placeholder="https://… ou chemin après upload (/uploads/avatars/…)"
        />
      </div>
      <div>
        <label htmlFor="settings-location" className="mb-1 block text-sm text-ink-secondary">
          Ville / région
        </label>
        <input
          id="settings-location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className={glassInputClass}
          placeholder="Paris"
        />
      </div>
      <div>
        <label htmlFor="settings-genre" className="mb-1 block text-sm text-ink-secondary">
          Genre préféré
        </label>
        <input
          id="settings-genre"
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

function SettingsPage() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const {
    user,
    profile,
    isLoading,
    isError,
    error,
    refetch,
    updateProfile,
    uploadAvatar,
    isUploadingAvatar,
    uploadAvatarError,
    deleteMyAccount,
    isDeletingAccount,
    deleteAccountError,
    isUpdating,
    updateError,
  } =
    useProfile();

  const profileFormKey = profile
    ? [profile.id, profile.bio, profile.avatarUrl, profile.location, profile.favoriteGenre].join("\0")
    : "none";

  return (
    <main className="mx-auto min-h-full max-w-5xl px-4 py-6 md:px-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-ink">Paramètres</h1>
        <Link to="/profile" className="text-sm text-ink-secondary underline hover:no-underline">
          Voir mon profil public
        </Link>
      </div>

      {isLoading && (
        <GlassPanel className="flex flex-col items-center justify-center gap-4 py-16">
          <Loader2 className="h-10 w-10 animate-spin text-accent-red" aria-hidden />
          <p className="text-ink-secondary">Chargement des paramètres…</p>
        </GlassPanel>
      )}

      {isError && (
        <GlassPanel className="border-red-500/40">
          <p>{error instanceof Error ? error.message : "Impossible de charger les paramètres."}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Réessayer
          </button>
        </GlassPanel>
      )}

      {!isLoading && !isError && user && (
        <div className="space-y-6">
          <GlassPanel className="space-y-3">
            <h2 className="text-lg font-semibold text-ink">Compte</h2>
            <div className="flex items-center gap-2 text-sm text-ink-secondary">
              <Mail className="h-4 w-4" aria-hidden />
              <span>{user.email}</span>
            </div>
            <div className="space-y-2 text-sm text-ink-secondary">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" aria-hidden />
                <span>Changement de mot de passe</span>
              </div>
              <p className="text-ink-muted">
                Pour confirmer qu&apos;il s&apos;agit bien de vous, nous envoyons un e-mail à votre adresse avec un
                lien sécurisé (valide 1 h) pour choisir un nouveau mot de passe.
              </p>
              {user.email ? (
                <Link
                  to="/forgot-password"
                  search={{ email: user.email }}
                  className="inline-block text-sm font-medium text-accent-red underline-offset-2 hover:underline"
                >
                  Recevoir l&apos;e-mail de changement de mot de passe
                </Link>
              ) : (
                <p className="text-sm text-ink-muted">Aucune adresse e-mail sur le compte.</p>
              )}
            </div>
          </GlassPanel>

          <GlassPanel className="space-y-4">
            <div className="flex items-center gap-2">
              <UserCog className="h-5 w-5 text-accent-red" aria-hidden />
              <h2 className="text-lg font-semibold text-ink">Profil public</h2>
            </div>
            <ProfileSettingsForm
              key={profileFormKey}
              profile={profile}
              onSubmit={updateProfile}
              onUploadAvatar={uploadAvatar}
              isUploadingAvatar={isUploadingAvatar}
              uploadAvatarError={uploadAvatarError}
              isUpdating={isUpdating}
              updateError={updateError}
            />
          </GlassPanel>

          <GlassPanel className="space-y-3 border-red-500/30">
            <h2 className="text-lg font-semibold text-red-300">Zone dangereuse</h2>
            <p className="text-sm text-ink-secondary">
              Supprimer votre compte efface votre profil et vos donnees associees. Cette action est irreversible.
            </p>
            {deleteAccountError && <p className="text-sm text-red-300">{deleteAccountError.message}</p>}
            <PrimaryButton
              type="button"
              disabled={isDeletingAccount}
              className="bg-red-600 hover:bg-red-700 active:bg-red-800"
              icon={<Trash2 aria-hidden />}
              onClick={async () => {
                const ok = window.confirm("Confirmer la suppression definitive de votre compte ?");
                if (!ok) return;
                await deleteMyAccount();
                clearAuth();
                window.location.href = "/";
              }}
            >
              {isDeletingAccount ? "Suppression..." : "Supprimer mon compte"}
            </PrimaryButton>
          </GlassPanel>
        </div>
      )}
    </main>
  );
}

