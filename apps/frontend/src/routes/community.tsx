import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, User, UserMinus, UserPlus, Users } from "lucide-react";
import { useUserSearch } from "@/hooks/useUserSearch";
import { useNormalizedApiError } from "@/hooks/useNormalizedApiError";
import { useAuth } from "@/hooks/useAuth";
import { followService } from "@/service/follow.service";
import { GlassPanel, PrimaryButton } from "@/components/glass";
import { glassInputClass } from "@/lib/glass-ui";
import { resolveMediaUrl } from "@/lib/api-origin";
import { RoundedAvatarImage } from "@/components/ui/RoundedAvatarImage";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/community")({
  component: CommunityPage,
});

const DEBOUNCE_MS = 350;
const PAGE_SIZE = 20;

function CommunityPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const myId = currentUser?.userId ?? null;

  const followToggle = useMutation({
    mutationFn: async (vars: { userId: number; follow: boolean }) => {
      if (vars.follow) {
        await followService.follow(vars.userId);
      } else {
        await followService.unfollow(vars.userId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "search"] });
      queryClient.invalidateQueries({ queryKey: ["following"] });
    },
  });

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
      <main className="mx-auto min-h-full max-w-6xl px-4 py-6 md:px-6">
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
          <GlassPanel className="py-12 text-center">
            <p className="text-sm text-ink-muted">
            Saisissez un nom ou un e-mail pour rechercher des membres.
            </p>
          </GlassPanel>
        )}

        {debouncedQuery && isLoading && (
          <GlassPanel className="flex flex-col items-center justify-center gap-3 py-12">
            <Loader2 className="h-10 w-10 animate-spin text-accent-red" aria-hidden />
            <p className="text-sm text-ink-muted">Recherche…</p>
          </GlassPanel>
        )}

        {debouncedQuery && isError && (
          <GlassPanel className="border-red-500/40 text-center text-sm text-red-300">
            {searchApiError?.message ?? "La recherche a échoué."}
          </GlassPanel>
        )}

        {showEmpty && (
          <GlassPanel className="py-10 text-center">
            <p className="text-ink-secondary">Aucun membre trouvé pour « {debouncedQuery} »</p>
          </GlassPanel>
        )}

        {debouncedQuery && users.length > 0 && (
          <>
            <ul className="space-y-3">
              {users.map((membre) => {
                const label = membre.name?.trim() || `Utilisateur #${membre.id}`;
                const avatar = membre.avatarUrl?.trim() || null;
                const avatarSrc = resolveMediaUrl(avatar);
                const isSelf = myId != null && membre.id === myId;
                const showFollow =
                  myId != null && !isSelf && typeof membre.isFollowing === "boolean";
                const following = membre.isFollowing === true;
                const busy = followToggle.isPending && followToggle.variables?.userId === membre.id;

                return (
                  <li key={membre.id}>
                    <div
                      className={cn(
                        "flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-3 backdrop-blur-[var(--glass-blur)]",
                        "transition-colors hover:border-[var(--glass-border-strong)] hover:bg-[var(--glass-bg-elevated)]"
                      )}
                    >
                      <Link
                        to="/profile/$userId"
                        params={{ userId: String(membre.id) }}
                        className="flex min-w-0 flex-1 items-center gap-3"
                      >
                        {avatarSrc ? (
                          <RoundedAvatarImage src={avatarSrc} alt="" sizeClassName="h-12 w-12" />
                        ) : (
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--glass-bg-elevated)] ring-1 ring-[var(--glass-border)]">
                            <User className="h-6 w-6 text-ink-muted" />
                          </div>
                        )}
                        <span className="min-w-0 truncate font-semibold text-ink">{label}</span>
                      </Link>
                      {isSelf && (
                        <span className="shrink-0 text-xs text-ink-muted">Vous</span>
                      )}
                      {showFollow && (
                        <PrimaryButton
                          type="button"
                          disabled={busy}
                          className="!shrink-0 !px-3 !py-1.5 text-xs"
                          onClick={(e) => {
                            e.preventDefault();
                            followToggle.mutate({ userId: membre.id, follow: !following });
                          }}
                        >
                          {following ? (
                            <>
                              <UserMinus className="mr-1 inline h-3.5 w-3.5" aria-hidden />
                              Ne plus suivre
                            </>
                          ) : (
                            <>
                              <UserPlus className="mr-1 inline h-3.5 w-3.5" aria-hidden />
                              Suivre
                            </>
                          )}
                        </PrimaryButton>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
            {hasMore && (
              <div className="mt-6 flex justify-center">
                <PrimaryButton
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={isFetching}
                  className="!px-4 !py-2 text-sm"
                >
                  {isFetching ? "Chargement…" : "Charger plus"}
                </PrimaryButton>
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
