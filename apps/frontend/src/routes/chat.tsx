import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { useChatRoom } from "@/hooks/useChatRoom";
import { requireAuth } from "@/lib/route-guard";
import { PrimaryButton } from "@/components/glass";
import { focusVisibleRingClass, focusVisibleRingInsetClass, glassInputClass } from "@/lib/glass-ui";
import { cn } from "@/lib/utils";
import { Loader2, MessageCircle, Send } from "lucide-react";

const DEFAULT_ROOMS = [
  { id: "global", label: "Général" },
] as const;

export const Route = createFileRoute("/chat")({
  beforeLoad: () => requireAuth(),
  component: ChatPage,
});

function formatMessageTime(s: string) {
  try {
    const d = new Date(s);
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

/**
 * Chat lives inside {@link AppShell} via root layout for authenticated users (issue #312).
 */
function ChatPage() {
  const [selectedRoomId, setSelectedRoomId] = useState<string>(DEFAULT_ROOMS[0].id);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isLoading,
    isError,
    error,
    refetch,
    sendMessage,
    isSending,
  } = useChatRoom({ roomId: selectedRoomId });

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputValue.trim();
    if (!text || isSending) return;
    sendMessage(text);
    setInputValue("");
  };

  const orderedMessages = messages;
  const roomLabel = DEFAULT_ROOMS.find((r) => r.id === selectedRoomId)?.label ?? selectedRoomId;

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col md:flex-row">
        {/* Sidebar: room list */}
        <aside className="flex w-full shrink-0 flex-col border-b border-[var(--glass-border)] md:w-56 md:border-b-0 md:border-r">
          <div className="border-b border-[var(--glass-border)] p-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
              Conversations
            </h2>
          </div>
          <nav className="flex flex-col gap-0.5 p-2">
            {DEFAULT_ROOMS.map((room) => (
              <button
                key={room.id}
                type="button"
                onClick={() => setSelectedRoomId(room.id)}
                className={cn(
                  "rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors",
                  focusVisibleRingInsetClass,
                  selectedRoomId === room.id
                    ? "bg-accent-red text-white"
                    : "text-ink-secondary hover:bg-[var(--glass-bg-elevated)] hover:text-ink"
                )}
              >
                <span className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  {room.label}
                </span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main — optional narrower column (plan §4) */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col md:max-w-2xl lg:max-w-3xl">
          {!selectedRoomId ? (
            <GlassPanel className="flex flex-1 flex-col items-center justify-center !py-16 text-center">
              <MessageCircle className="mb-4 h-12 w-12 text-ink-muted" aria-hidden />
              <p className="text-ink-secondary">Sélectionnez une conversation</p>
            </GlassPanel>
          ) : (
            <GlassPanel className="flex min-h-[min(32rem,calc(100dvh-7rem))] flex-1 flex-col !p-0 md:min-h-[min(36rem,calc(100dvh-8rem))]">
              <div className="shrink-0 border-b border-[var(--glass-border)] px-4 py-3">
                <h1 className="font-semibold text-ink">{roomLabel}</h1>
              </div>

              {isLoading && (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8">
                  <Loader2 className="h-10 w-10 animate-spin text-accent-red" aria-hidden />
                  <span className="sr-only">Chargement des messages…</span>
                </div>
              )}

              {isError && (
                <div className="m-4 flex flex-1 flex-col items-center justify-center gap-4 rounded-[var(--radius-glass)] border border-red-500/40 bg-red-950/30 px-6 py-8 text-center backdrop-blur-sm">
                  <p className="text-sm text-red-200">
                    {error instanceof Error ? error.message : "Impossible de charger les messages."}
                  </p>
                  <button
                    type="button"
                    onClick={() => refetch()}
                    className={cn(
                      "rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700",
                      focusVisibleRingClass
                    )}
                  >
                    Réessayer
                  </button>
                </div>
              )}

              {!isLoading && !isError && (
                <>
                  <div className="min-h-0 flex-1 overflow-y-auto p-4">
                    <div className="space-y-3">
                      {orderedMessages.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <MessageCircle className="mb-4 h-12 w-12 text-ink-muted" aria-hidden />
                          <p className="text-sm text-ink-secondary">Aucun message. Envoyez le premier !</p>
                        </div>
                      )}
                      {orderedMessages.map((m, index) => (
                        <div
                          key={m.id ?? `msg-${index}-${m.createdAt}`}
                          className="flex max-w-[90%] flex-col gap-0.5"
                        >
                          <div className="flex items-baseline gap-2">
                            <span className="shrink-0 text-xs font-medium text-accent-red">
                              {m.senderEmail ?? "Anonyme"}
                            </span>
                            <span className="text-xs text-ink-muted">{formatMessageTime(m.createdAt)}</span>
                          </div>
                          <p className="break-words text-sm text-ink">{m.content}</p>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>

                  <form
                    onSubmit={handleSubmit}
                    className="flex shrink-0 gap-2 border-t border-[var(--glass-border)] bg-[var(--glass-bg)]/80 px-4 py-3 backdrop-blur-sm"
                  >
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Écrivez un message…"
                      className={cn(glassInputClass, "flex-1 text-sm")}
                      disabled={isSending}
                      maxLength={2000}
                    />
                    <PrimaryButton
                      type="submit"
                      disabled={!inputValue.trim() || isSending}
                      icon={<Send className="h-4 w-4" aria-hidden />}
                      className="shrink-0"
                      aria-label="Envoyer"
                    >
                      Envoyer
                    </PrimaryButton>
                  </form>
                </>
              )}
            </GlassPanel>
          )}
        </div>
      </div>
    </div>
  );
}
