import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { normalizeApiError } from "@/lib/normalize-api-error";
import { GlassPanel, PrimaryButton } from "@/components/glass";
import { glassInputClass } from "@/lib/glass-ui";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    setError(null);
    if (!email.trim()) {
      setError("L'email est requis.");
      return false;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setError("Veuillez entrer une adresse email valide.");
      return false;
    }
    if (!password) {
      setError("Le mot de passe est requis.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || submitting) return;

    setSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      navigate({ to: "/" });
    } catch (err: unknown) {
      setError(normalizeApiError(err).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-zinc-950" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/85 via-app-base to-zinc-950"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_-5%,rgba(220,38,38,0.14),transparent_55%)]"
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-md space-y-6">
        <Link
          to="/"
          className="inline-block text-sm text-ink-secondary transition-colors hover:text-ink"
        >
          ← Retour à l&apos;accueil
        </Link>

        <div className="flex items-center gap-2 text-2xl font-bold">
          <span aria-hidden>🎬</span>
          <span>
            <span className="text-accent-red">Ciné</span>
            <span className="text-ink">Connect</span>
          </span>
        </div>

        <GlassPanel className="space-y-6 border-[var(--glass-border-strong)] shadow-2xl shadow-black/50">
          <div>
            <h1 className="text-3xl font-bold text-ink">Se connecter</h1>
            <p className="mt-1 text-ink-secondary">Bon retour parmi les cinéphiles</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div
                className="rounded-xl border border-red-400/45 bg-red-950/90 px-4 py-3 text-sm text-red-50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-sm"
                role="alert"
              >
                {error}
              </div>
            )}

            <div>
              <label htmlFor="login-email" className="mb-1 block text-sm font-medium text-ink">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={glassInputClass}
                disabled={submitting}
              />
            </div>

            <div>
              <label htmlFor="login-password" className="mb-1 block text-sm font-medium text-ink">
                Mot de passe
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={glassInputClass}
                disabled={submitting}
              />
            </div>

            <PrimaryButton type="submit" disabled={submitting} className="w-full py-3">
              {submitting ? "Connexion…" : "Se connecter"}
            </PrimaryButton>
          </form>

          <p className="text-center text-sm text-ink-muted">
            Pas encore de compte ?{" "}
            <Link
              to="/register"
              className="font-medium text-accent-red transition-colors hover:text-accent-red-hover hover:underline"
            >
              S&apos;inscrire
            </Link>
          </p>
        </GlassPanel>
      </div>
    </div>
  );
}
