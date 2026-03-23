import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { normalizeApiError } from "@/lib/normalize-api-error";

export const Route = createFileRoute("/LoginPage")({
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
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4 py-10">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-6 inline-block text-sm text-gray-400 transition-colors hover:text-white"
        >
          ← Retour à l'accueil
        </Link>

        <div className="mb-6 flex items-center gap-2 text-2xl font-bold">
          <span>🎬</span>
          <span>
            <span className="text-[#e53e3e]">Ciné</span>
            <span className="text-[#f6ad55]">Connect</span>
          </span>
        </div>

        <h1 className="mb-2 text-3xl font-bold text-white">Se connecter</h1>
        <p className="mb-8 text-gray-400">Bon retour parmi les cinéphiles</p>

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
            <label htmlFor="login-email" className="mb-1 block text-sm font-medium text-white">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-600 bg-[#1a1a1a] px-4 py-2.5 text-white placeholder-gray-500 outline-none transition-colors focus:border-[#e53e3e]"
              disabled={submitting}
            />
          </div>

          <div>
            <label htmlFor="login-password" className="mb-1 block text-sm font-medium text-white">
              Mot de passe
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-600 bg-[#1a1a1a] px-4 py-2.5 text-white placeholder-gray-500 outline-none transition-colors focus:border-[#e53e3e]"
              disabled={submitting}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-[#e53e3e] py-3 font-semibold text-white transition-colors hover:bg-[#c53030] disabled:opacity-50"
          >
            {submitting ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          Pas encore de compte ?{" "}
          <Link to="/RegisterPage" className="text-[#f6ad55] hover:underline">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  );
}
