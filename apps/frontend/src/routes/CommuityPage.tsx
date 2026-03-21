import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Clapperboard, Loader2, User, Users } from "lucide-react";
import { useUserSearch } from "@/hooks/useUserSearch";

export const Route = createFileRoute("/CommuityPage")({
  component: CommunautePage,
});

const DEBOUNCE_MS = 350;
const PAGE_SIZE = 20;

function CommunautePage() {
  const [inputValue, setInputValue] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(inputValue.trim());
      setPage(1);
    }, DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [inputValue]);

  const limit = page * PAGE_SIZE;

  const { data, isLoading, isError, error, isFetching } = useUserSearch(debouncedQuery, {
    limit,
    offset: 0,
    enabled: debouncedQuery.length > 0,
  });

  const users = data?.users ?? [];
  const total = data?.total ?? 0;
  const hasMore = users.length < total;
  const showEmpty =
    debouncedQuery.length > 0 && !isLoading && !isError && users.length === 0 && !isFetching;

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 border-b border-zinc-800/50 bg-black/90 backdrop-blur-sm px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 font-extrabold text-xl tracking-tight text-white hover:text-zinc-300 transition-colors"
          >
            <Clapperboard className="w-6 h-6 text-red-500" />
            <span>
              <span className="text-red-500">Ciné</span>
              <span className="text-orange-400">Connect</span>
            </span>
          </Link>
          <Link to="/" className="text-sm text-zinc-400 hover:text-white transition-colors">
            ← Accueil
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex items-center gap-3">
          <Users className="h-8 w-8 text-red-500" />
          <h1 className="text-2xl font-bold">Communauté</h1>
        </div>

        <input
          type="search"
          placeholder="Rechercher un membre (nom ou e-mail)…"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          autoComplete="off"
          className="mb-6 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
        />

        {!debouncedQuery && (
          <p className="text-center text-zinc-500 text-sm">
            Saisissez un nom ou un e-mail pour rechercher des membres.
          </p>
        )}

        {debouncedQuery && isLoading && (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <Loader2 className="h-10 w-10 animate-spin text-red-500" />
            <p className="text-sm text-zinc-500">Recherche…</p>
          </div>
        )}

        {debouncedQuery && isError && (
          <p className="text-center text-red-400 text-sm">
            {error instanceof Error ? error.message : "La recherche a échoué."}
          </p>
        )}

        {showEmpty && (
          <p className="text-center text-zinc-400">
            Aucun membre trouvé pour « {debouncedQuery} »
          </p>
        )}

        {debouncedQuery && users.length > 0 && (
          <>
            <ul className="space-y-3">
              {users.map((membre) => {
                const label = membre.name?.trim() || `Utilisateur #${membre.id}`;
                const avatar = membre.avatarUrl?.trim() || null;
                return (
                  <li key={membre.id}>
                    <Link
                      to="/profile/$userId"
                      params={{ userId: String(membre.id) }}
                      className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 transition-colors hover:border-zinc-600 hover:bg-zinc-900"
                    >
                      {avatar ? (
                        <img
                          src={avatar}
                          alt=""
                          className="h-12 w-12 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-zinc-800">
                          <User className="h-6 w-6 text-zinc-500" />
                        </div>
                      )}
                      <span className="font-semibold text-white">{label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-6 flex flex-col items-center gap-2 text-sm text-zinc-500">
              <span>
                {users.length} sur {total} résultat
                {total > 1 ? "s" : ""}
              </span>
              {hasMore && (
                <button
                  type="button"
                  disabled={isFetching}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-zinc-600 px-4 py-2 text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
                >
                  {isFetching ? "Chargement…" : "Charger plus"}
                </button>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default CommunautePage;
