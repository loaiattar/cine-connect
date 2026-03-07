import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clapperboard, Loader2 } from "lucide-react";
import { usersService } from "../service/users.service";

export const Route = createFileRoute("/ProfilePage")({
  component: ProfilePage,
});

function ProfilePage() {
  const { userId } = Route.useSearch() as { userId?: string };
  const [tab, setTab] = useState<"followers" | "following">("followers");

  const { data: followers = [], isLoading: loadingFollowers } = useQuery({
    queryKey: ["followers", userId],
    queryFn: () => usersService.getFollowers(Number(userId)),
    enabled: !!userId,
  });

  const { data: following = [], isLoading: loadingFollowing } = useQuery({
    queryKey: ["following", userId],
    queryFn: () => usersService.getFollowing(Number(userId)),
    enabled: !!userId,
  });

  const list = tab === "followers" ? followers : following;
  const isLoading = tab === "followers" ? loadingFollowers : loadingFollowing;

  if (!userId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-zinc-400">
        Aucun utilisateur sélectionné.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 border-b border-zinc-800/50 bg-black/90 backdrop-blur-sm px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-extrabold text-xl text-white hover:text-zinc-300">
            <Clapperboard className="w-6 h-6 text-red-500" />
            <span className="text-red-500">Ciné</span>
            <span className="text-orange-400">Connect</span>
          </Link>
          <Link to="/" className="text-sm text-zinc-400 hover:text-white">← Accueil</Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="mb-8 text-2xl font-bold">Profil #{userId}</h1>

        <div className="mb-6 flex gap-2 border-b border-zinc-800">
          <button
            type="button"
            onClick={() => setTab("followers")}
            className={`px-4 py-2 text-sm font-semibold transition-colors ${tab === "followers" ? "border-b-2 border-red-500 text-white" : "text-zinc-400 hover:text-white"}`}
          >
            Abonnés ({followers.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("following")}
            className={`px-4 py-2 text-sm font-semibold transition-colors ${tab === "following" ? "border-b-2 border-red-500 text-white" : "text-zinc-400 hover:text-white"}`}
          >
            Abonnements ({following.length})
          </button>
        </div>

        {isLoading && (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-red-500" />
          </div>
        )}

        {!isLoading && list.length === 0 && (
          <p className="py-12 text-center text-zinc-400">
            {tab === "followers" ? "Aucun abonné pour le moment." : "Aucun abonnement pour le moment."}
          </p>
        )}

        {!isLoading && list.length > 0 && (
          <ul className="space-y-3">
            {list.map((user) => (
              <li key={user.id} className="flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 font-bold">
                  {(user.name ?? user.email)[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{user.name ?? "Utilisateur"}</p>
                  <p className="text-sm text-zinc-400">{user.email}</p>
                </div>
                <Link
                  to="/ProfilePage"
                  search={{ userId: String(user.id) }}
                  className="text-sm text-red-500 hover:text-red-400"
                >
                  Voir le profil →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

export default ProfilePage;
