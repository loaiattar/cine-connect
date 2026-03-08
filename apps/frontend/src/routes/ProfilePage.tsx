import { createFileRoute, Link } from "@tanstack/react-router";
import { Clapperboard, User } from "lucide-react";

export const Route = createFileRoute("/ProfilePage")({
  validateSearch: (search: Record<string, unknown>) => ({
    userId: String(search.userId ?? ""),
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { userId } = Route.useSearch();

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 border-b border-zinc-800/50 bg-black/90 backdrop-blur-sm px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-extrabold text-xl text-white hover:text-zinc-300">
            <Clapperboard className="w-6 h-6 text-red-500" />
            <span className="text-red-500">Ciné</span><span className="text-orange-400">Connect</span>
          </Link>
          <Link to="/users" className="text-sm text-zinc-400 hover:text-white">← Communauté</Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Profil utilisateur</h1>
            <p className="text-sm text-zinc-400">ID : {userId}</p>
          </div>
        </div>

        <p className="text-zinc-400">Page de profil en cours de développement.</p>
      </main>
    </div>
  );
}

export default ProfilePage;
