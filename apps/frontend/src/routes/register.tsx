import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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
    <div className="flex min-h-dvh bg-app-base">
      {/* Colonne gauche : formulaire */}
      <div className="flex flex-1 flex-col justify-center overflow-y-auto px-8 py-10 md:px-12">
        <Link
          to="/"
          className="mb-8 w-fit text-sm text-ink-secondary transition-colors hover:text-ink"
        >
          ← Retour
        </Link>

        <div className="mb-6 flex items-center gap-2 text-2xl font-bold">
          <span aria-hidden>🎬</span>
          <span>
            <span className="text-accent-red">Ciné</span>
            <span className="text-ink">Connect</span>
          </span>
        </div>

        <GlassPanel className="max-w-lg space-y-6">
        <h1 className="text-4xl font-bold text-ink">Créer un compte</h1>
        <p className="text-ink-secondary">Rejoignez la communauté des cinéphiles</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div
              className="rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-200"
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
          <Link to="/login" className="text-accent-red-hover hover:underline">
            Se connecter
          </Link>
        </p>
        </GlassPanel>
      </div>

      {/* Colonne droite : panneau info (caché sur petit écran) */}
      <div className="hidden flex-1 flex-col justify-center overflow-y-auto border-l border-[var(--glass-border)] bg-[var(--glass-bg)] px-12 py-10 backdrop-blur-[var(--glass-blur)] md:flex">
        <GlassPanel className="!p-8">
          <h2 className="mb-4 text-3xl font-bold text-ink">
            Rejoignez <span className="text-accent-red">8,547</span> cinéphiles
          </h2>
          <p className="mb-8 text-ink-secondary">
            Découvrez une communauté passionnée qui partage, discute et recommande les meilleurs films.
          </p>
          <div className="mb-4 flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-red text-lg" aria-hidden>🎬</div>
            <div>
              <p className="font-bold text-ink">+12,500 films</p>
              <p className="text-sm text-ink-secondary">Dans notre catalogue</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--glass-bg-elevated)] text-lg ring-1 ring-[var(--glass-border)]" aria-hidden>👤</div>
            <div>
              <p className="font-bold text-ink">+45,000 critiques</p>
              <p className="text-sm text-ink-secondary">Publiées par nos membres</p>
            </div>
          </div>
        </GlassPanel>
        <GlassPanel className="mt-6 !p-8">
          <div className="mb-4 text-ink-secondary">★★★★★</div>
          <p className="mb-4 italic text-ink">
            &quot;CinéConnect a complètement changé ma façon de découvrir le cinéma. La communauté est incroyable !&quot;
          </p>
          <p className="text-sm text-ink-secondary">— Sophie, membre depuis 2024</p>
        </GlassPanel>
      </div>
    </div>
  );
}
