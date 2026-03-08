import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/RegisterPage")({
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
      const authErr = err as { status?: number; message?: string };
      setError(authErr.message ?? "Une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      {/* Colonne gauche : formulaire */}
      <div className="flex flex-1 flex-col justify-center overflow-y-auto px-8 py-10 md:px-12">
        <Link
          to="/"
          className="mb-8 w-fit text-sm text-gray-400 transition-colors hover:text-white"
        >
          ← Retour
        </Link>

        <div className="mb-6 flex items-center gap-2 text-2xl font-bold">
          <span>🎬</span>
          <span>
            <span className="text-[#e53e3e]">Ciné</span>
            <span className="text-[#f6ad55]">Connect</span>
          </span>
        </div>

        <h1 className="mb-2 text-4xl font-bold text-white">Créer un compte</h1>
        <p className="mb-8 text-gray-400">Rejoignez la communauté des cinéphiles</p>

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
            <label htmlFor="register-name" className="mb-1 block text-sm font-medium text-white">
              Nom d'utilisateur
            </label>
            <input
              id="register-name"
              type="text"
              autoComplete="name"
              placeholder="JohnDoe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-600 bg-[#1a1a1a] px-4 py-2.5 text-white placeholder-gray-500 outline-none transition-colors focus:border-[#e53e3e]"
              disabled={submitting}
            />
          </div>

          <div>
            <label htmlFor="register-email" className="mb-1 block text-sm font-medium text-white">
              Email
            </label>
            <input
              id="register-email"
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
            <label htmlFor="register-password" className="mb-1 block text-sm font-medium text-white">
              Mot de passe
            </label>
            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-600 bg-[#1a1a1a] px-4 py-2.5 text-white placeholder-gray-500 outline-none transition-colors focus:border-[#e53e3e]"
              disabled={submitting}
            />
            <p className="mt-1 text-xs text-gray-500">
              Minimum {MIN_PASSWORD_LENGTH} caractères
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-[#e53e3e] py-3 font-semibold text-white transition-colors hover:bg-[#c53030] disabled:opacity-50"
          >
            {submitting ? "Création du compte…" : "Créer mon compte"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          Vous avez déjà un compte ?{" "}
          <Link to="/LoginPage" className="text-[#f6ad55] hover:underline">
            Se connecter
          </Link>
        </p>
      </div>

      {/* Colonne droite : panneau info (caché sur petit écran) */}
      <div className="hidden flex-1 flex-col justify-center overflow-y-auto bg-[#111111] px-12 py-10 md:flex">
        <div className="rounded-2xl bg-[#1a1a1a] p-8">
          <h2 className="mb-4 text-3xl font-bold text-white">
            Rejoignez <span className="text-[#e53e3e]">8,547</span> cinéphiles
          </h2>
          <p className="mb-8 text-gray-400">
            Découvrez une communauté passionnée qui partage, discute et recommande les meilleurs films.
          </p>
          <div className="mb-4 flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e53e3e]">🎬</div>
            <div>
              <p className="font-bold text-white">+12,500 films</p>
              <p className="text-sm text-gray-400">Dans notre catalogue</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f6ad55]">👤</div>
            <div>
              <p className="font-bold text-white">+45,000 critiques</p>
              <p className="text-sm text-gray-400">Publiées par nos membres</p>
            </div>
          </div>
        </div>
        <div className="mt-6 rounded-2xl bg-[#1a1a1a] p-8">
          <div className="mb-4 text-yellow-400">★★★★★</div>
          <p className="mb-4 italic text-white">
            "CinéConnect a complètement changé ma façon de découvrir le cinéma. La communauté est incroyable !"
          </p>
          <p className="text-sm text-gray-400">— Sophie, membre depuis 2024</p>
        </div>
      </div>
    </div>
  );
}
