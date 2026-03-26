import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Clapperboard } from "lucide-react";
import { GlassPanel, PrimaryButton } from "@/components/glass";
import { glassInputClass } from "@/lib/glass-ui";
import { authService } from "@/service/auth.service";
import { normalizeApiError } from "@/lib/normalize-api-error";

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const { token } = Route.useSearch();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    if (!token) {
      setError("Lien de reinitialisation invalide.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setSubmitting(true);
    try {
      await authService.resetPassword({ token, newPassword });
      setDone(true);
      setTimeout(() => {
        navigate({ to: "/login" });
      }, 1200);
    } catch (err: unknown) {
      setError(normalizeApiError(err).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-10">
      <div className="relative z-10 w-full max-w-md space-y-6">
        <Link to="/login" className="inline-block text-sm text-ink-secondary transition-colors hover:text-ink">
          ← Retour a la connexion
        </Link>
        <div className="flex items-center gap-2 text-2xl font-bold">
          <Clapperboard className="h-8 w-8 shrink-0 text-accent-red" aria-hidden />
          <span className="text-ink"><span className="text-accent-red">Lume</span>ra</span>
        </div>
        <GlassPanel className="space-y-6 border-[var(--glass-border-strong)] shadow-2xl shadow-black/50">
          <div>
            <h1 className="text-3xl font-bold text-ink">Reinitialiser le mot de passe</h1>
            <p className="mt-1 text-ink-secondary">Saisissez un nouveau mot de passe</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="rounded-xl border border-red-400/45 bg-red-950/90 px-4 py-3 text-sm text-red-50">{error}</div>}
            {done && (
              <div className="rounded-xl border border-emerald-400/45 bg-emerald-950/60 px-4 py-3 text-sm text-emerald-100">
                Mot de passe mis a jour. Redirection...
              </div>
            )}
            <div>
              <label htmlFor="new-password" className="mb-1 block text-sm font-medium text-ink">Nouveau mot de passe</label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={glassInputClass}
                disabled={submitting}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="mb-1 block text-sm font-medium text-ink">Confirmer le mot de passe</label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={glassInputClass}
                disabled={submitting}
              />
            </div>
            <PrimaryButton type="submit" disabled={submitting} className="w-full py-3">
              {submitting ? "Validation..." : "Mettre a jour"}
            </PrimaryButton>
          </form>
        </GlassPanel>
      </div>
    </div>
  );
}

