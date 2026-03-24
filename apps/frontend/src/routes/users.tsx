import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { apiClient } from "../lib/api-client";
import { useAuth } from "../hooks/useAuth";
import { AppNavLayout } from "@/components/layout/AppNavLayout";
import { PrimaryButton } from "@/components/glass";
import { glassInputClass } from "@/lib/glass-ui";

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
          <Users className="h-8 w-8 text-accent-red" aria-hidden />
          <h1 className="text-2xl font-bold text-ink">Communauté</h1>
        </div>

        <input
          type="text"
          placeholder="Rechercher un membre..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          className={`${glassInputClass} mb-6`}
        />

        {resultats.length === 0 && (
          <p className="text-center text-ink-secondary">Aucun membre trouvé pour &quot;{recherche}&quot;</p>
        )}

        <ul className="space-y-3">
          {resultats.map((user) => (
            <li
              key={user.id}
              className="flex items-center gap-4 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-3 backdrop-blur-[var(--glass-blur)]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-red font-bold text-white">
                {user.name[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-ink">{user.name}</p>
                <p className="text-sm text-ink-secondary">{user.email}</p>
              </div>
              <Link
                to="/profile/$userId"
                params={{ userId: String(user.id) }}
                className="text-sm text-ink-secondary transition-colors hover:text-ink"
              >
                Voir profil
              </Link>
              {isLoggedIn && (
                suivis.includes(user.id) ? (
                  <span className="cursor-default rounded-xl border border-[var(--glass-border)] px-3 py-1.5 text-sm font-medium text-ink-muted">
                    Suivi
                  </span>
                ) : (
                  <PrimaryButton
                    type="button"
                    disabled={followMutation.isPending}
                    onClick={() => followMutation.mutate(user.id)}
                    className="!px-3 !py-1.5 text-xs"
                  >
                    Suivre
                  </PrimaryButton>
                )
              )}
            </li>
          ))}
        </ul>
      </main>
    </AppNavLayout>
  );
}

export default UsersPage;
