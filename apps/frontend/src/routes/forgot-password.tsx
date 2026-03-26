import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Clapperboard } from "lucide-react";
import { GlassPanel, PrimaryButton } from "@/components/glass";
import { glassInputClass } from "@/lib/glass-ui";
import { authService } from "@/service/auth.service";
import { normalizeApiError } from "@/lib/normalize-api-error";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      await authService.forgotPassword({ email: email.trim() });
      setDone(true);
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
            <h1 className="text-3xl font-bold text-ink">Mot de passe oublie</h1>
            <p className="mt-1 text-ink-secondary">Recevez un lien de reinitialisation</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="rounded-xl border border-red-400/45 bg-red-950/90 px-4 py-3 text-sm text-red-50">{error}</div>}
            {done && (
              <div className="rounded-xl border border-emerald-400/45 bg-emerald-950/60 px-4 py-3 text-sm text-emerald-100">
                Si un compte existe avec cet email, un lien de reinitialisation a ete envoye.
              </div>
            )}
            <div>
              <label htmlFor="forgot-email" className="mb-1 block text-sm font-medium text-ink">Email</label>
              <input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={glassInputClass}
                placeholder="votre@email.com"
                disabled={submitting}
              />
            </div>
            <PrimaryButton type="submit" disabled={submitting} className="w-full py-3">
              {submitting ? "Envoi..." : "Envoyer le lien"}
            </PrimaryButton>
          </form>
        </GlassPanel>
      </div>
    </div>
  );
}

