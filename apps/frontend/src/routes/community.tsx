import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, User, Users } from "lucide-react";
import { useUserSearch } from "@/hooks/useUserSearch";
import { useNormalizedApiError } from "@/hooks/useNormalizedApiError";
import { glassInputClass } from "@/lib/glass-ui";

export const Route = createFileRoute("/community")({
  component: CommunityPage,
});

const DEBOUNCE_MS = 350;
const PAGE_SIZE = 20;

function CommunityPage() {
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

  const searchApiError = useNormalizedApiError(isError ? error : null);

  const users = data?.users ?? [];
  const total = data?.total ?? 0;
  const hasMore = users.length < total;
  const showEmpty =
    debouncedQuery.length > 0 && !isLoading && !isError && users.length === 0 && !isFetching;

  return (
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex items-center gap-3">
          <Users className="h-8 w-8 text-accent-red" aria-hidden />
          <h1 className="text-2xl font-bold text-ink">Communauté</h1>
        </div>

        <input
          type="search"
          placeholder="Rechercher un membre (nom ou e-mail)…"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          autoComplete="off"
          className={`${glassInputClass} mb-6`}
        />

        {!debouncedQuery && (
          <p className="text-center text-sm text-ink-muted">
            Saisissez un nom ou un e-mail pour rechercher des membres.
          </p>
        )}

        {debouncedQuery && isLoading && (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <Loader2 className="h-10 w-10 animate-spin text-accent-red" aria-hidden />
            <p className="text-sm text-ink-muted">Recherche…</p>
          </div>
        )}

        {debouncedQuery && isError && (
          <p className="text-center text-sm text-red-300">
            {searchApiError?.message ?? "La recherche a échoué."}
          </p>
        )}

        {showEmpty && (
          <p className="text-center text-ink-secondary">
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
                      className="flex items-center gap-3 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-3 backdrop-blur-[var(--glass-blur)] transition-colors hover:border-[var(--glass-border-strong)] hover:bg-[var(--glass-bg-elevated)]"
                    >
                      {avatar ? (
                        <img
                          src={avatar}
                          alt=""
                          className="h-12 w-12 shrink-0 rounded-full object-cover ring-1 ring-[var(--glass-border)]"
                        />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--glass-bg-elevated)] ring-1 ring-[var(--glass-border)]">
                          <User className="h-6 w-6 text-ink-muted" />
                        </div>
                      )}
                      <span className="font-semibold text-ink">{label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            {hasMore && (
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={isFetching}
                  className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-[var(--glass-bg-elevated)] disabled:opacity-50"
                >
                  {isFetching ? "Chargement…" : "Charger plus"}
                </button>
              </div>
            )}
            <p className="mt-4 text-center text-xs text-ink-muted">
              {users.length} / {total} membres
            </p>
          </>
        )}
      </main>
  );
}

export default CommunityPage;
