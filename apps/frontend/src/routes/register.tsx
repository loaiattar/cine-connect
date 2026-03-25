import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Clapperboard } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { normalizeApiError } from "@/lib/normalize-api-error";
import { GlassPanel, PrimaryButton } from "@/components/glass";
import { glassInputClass } from "@/lib/glass-ui";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const validate = (): boolean => {
    setError(null);
    if (!name.trim()) {
      setError("Le nom est requis.");
      return false;
    }
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
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || submitting) return;

    setSubmitting(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
      });
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
          <Clapperboard className="h-8 w-8 shrink-0 text-accent-red" aria-hidden />
          <span className="text-ink">
            <span className="text-accent-red">Lume</span>
            <span>ra</span>
          </span>
        </div>

        <GlassPanel className="space-y-6 border-[var(--glass-border-strong)] shadow-2xl shadow-black/50">
          <div>
            <h1 className="text-3xl font-bold text-ink">Créer un compte</h1>
            <p className="mt-1 text-ink-secondary">Rejoignez la communauté des cinéphiles</p>
            <p className="mt-3 text-xs leading-relaxed text-ink-muted">
              Listes, favoris et avis — tout votre cinéma au même endroit.
            </p>
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
              <label htmlFor="register-name" className="mb-1 block text-sm font-medium text-ink">
                Nom d&apos;utilisateur
              </label>
              <input
                id="register-name"
                type="text"
                autoComplete="name"
                placeholder="JohnDoe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={glassInputClass}
                disabled={submitting}
              />
            </div>

            <div>
              <label htmlFor="register-email" className="mb-1 block text-sm font-medium text-ink">
                Email
              </label>
              <input
                id="register-email"
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
              <label htmlFor="register-password" className="mb-1 block text-sm font-medium text-ink">
                Mot de passe
              </label>
              <input
                id="register-password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={glassInputClass}
                disabled={submitting}
              />
              <p className="mt-1 text-xs text-ink-muted">
                Minimum {MIN_PASSWORD_LENGTH} caractères
              </p>
            </div>

            <PrimaryButton type="submit" disabled={submitting} className="w-full py-3">
              {submitting ? "Création du compte…" : "Créer mon compte"}
            </PrimaryButton>
          </form>

          <p className="text-center text-sm text-ink-muted">
            Vous avez déjà un compte ?{" "}
            <Link
              to="/login"
              className="font-medium text-accent-red transition-colors hover:text-accent-red-hover hover:underline"
            >
              Se connecter
            </Link>
          </p>
        </GlassPanel>
      </div>
    </div>
  );
}
