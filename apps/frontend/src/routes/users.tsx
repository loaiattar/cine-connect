import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { apiClient } from "../lib/api-client";
import { useAuth } from "../hooks/useAuth";
import { AppNavLayout } from "@/components/layout/AppNavLayout";

export const Route = createFileRoute("/users")({
  component: UsersPage,
});

// Données mock — à remplacer quand /api/v1/users/search sera disponible
const mockUsers = [
  { id: 1, name: "Alice Martin", email: "alice@example.com" },
  { id: 2, name: "Tom Dubois", email: "tom@example.com" },
  { id: 3, name: "Sara Benali", email: "sara@example.com" },
  { id: 4, name: "Karim Leroy", email: "karim@example.com" },
];

function UsersPage() {
  const [recherche, setRecherche] = useState("");
  const [suivis, setSuivis] = useState<number[]>([]);
  const { isAuthenticated: isLoggedIn } = useAuth();
  const queryClient = useQueryClient();

  const followMutation = useMutation({
    mutationFn: (followingId: number) =>
      apiClient.post("/api/v1/follows", { followingId }),
    onSuccess: (_, followingId) => {
      setSuivis((prev) => [...prev, followingId]);
      queryClient.invalidateQueries({ queryKey: ["following"] });
    },
  });

  const resultats = mockUsers.filter((u) =>
    u.name.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <AppNavLayout variant="simple">
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex items-center gap-3">
          <Users className="h-8 w-8 text-red-500" />
          <h1 className="text-2xl font-bold">Communauté</h1>
        </div>

        <input
          type="text"
          placeholder="Rechercher un membre..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          className="mb-6 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
        />

        {resultats.length === 0 && (
          <p className="text-center text-zinc-400">Aucun membre trouvé pour "{recherche}"</p>
        )}

        <ul className="space-y-3">
          {resultats.map((user) => (
            <li key={user.id} className="flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 font-bold">
                {user.name[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-zinc-400">{user.email}</p>
              </div>
              <Link
                to="/ProfilePage"
                search={{ userId: String(user.id) }}
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Voir profil
              </Link>
              {isLoggedIn && (
                <button
                  type="button"
                  disabled={suivis.includes(user.id) || followMutation.isPending}
                  onClick={() => followMutation.mutate(user.id)}
                  className={`rounded-lg px-3 py-1 text-sm font-semibold transition-colors ${
                    suivis.includes(user.id)
                      ? "bg-zinc-700 text-zinc-400 cursor-default"
                      : "bg-red-600 text-white hover:bg-red-500"
                  }`}
                >
                  {suivis.includes(user.id) ? "Suivi" : "Suivre"}
                </button>
              )}
            </li>
          ))}
        </ul>
      </main>
    </AppNavLayout>
  );
}

export default UsersPage;
