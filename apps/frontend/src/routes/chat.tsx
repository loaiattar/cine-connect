import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { useChatRoom } from "@/hooks/useChatRoom";
import { requireAuth } from "@/lib/route-guard";
import { Clapperboard, Loader2, MessageCircle, Send } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="sticky top-0 z-50 border-b border-zinc-800/50 bg-black/90 backdrop-blur-sm px-6 py-4 shrink-0">
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
          <Link
            to="/"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            ← Accueil
          </Link>
        </div>
      </header>

      <div className="flex-1 flex min-h-0 mx-auto w-full max-w-5xl">
        {/* Sidebar: room list */}
        <aside className="w-56 shrink-0 border-r border-zinc-800 flex flex-col">
          <div className="p-3 border-b border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
              Conversations
            </h2>
          </div>
          <nav className="p-2 flex flex-col gap-0.5">
            {DEFAULT_ROOMS.map((room) => (
              <button
                key={room.id}
                type="button"
                onClick={() => setSelectedRoomId(room.id)}
                className={`text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedRoomId === room.id
                    ? "bg-red-600 text-white"
                    : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  {room.label}
                </span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main: message list + input */}
        <main className="flex-1 flex flex-col min-w-0 bg-zinc-950/50">
          {!selectedRoomId ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center text-zinc-500">
                <MessageCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Sélectionnez une conversation</p>
              </div>
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-zinc-800 shrink-0">
                <h1 className="font-semibold text-white">
                  {DEFAULT_ROOMS.find((r) => r.id === selectedRoomId)?.label ?? selectedRoomId}
                </h1>
              </div>

              {isLoading && (
                <div className="flex-1 flex items-center justify-center p-8">
                  <Loader2 className="h-10 w-10 animate-spin text-red-500" aria-hidden />
                  <span className="sr-only">Chargement des messages…</span>
                </div>
              )}

              {isError && (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
                  <p className="text-red-400 text-center">
                    {error instanceof Error ? error.message : "Impossible de charger les messages."}
                  </p>
                  <button
                    type="button"
                    onClick={() => refetch()}
                    className="rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
                  >
                    Réessayer
                  </button>
                </div>
              )}

              {!isLoading && !isError && (
                <>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {orderedMessages.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-12 text-zinc-500 text-center">
                        <MessageCircle className="h-12 w-12 mb-4 opacity-50" />
                        <p>Aucun message. Envoyez le premier !</p>
                      </div>
                    )}
                    {orderedMessages.map((m, index) => (
                      <div
                        key={m.id ?? `msg-${index}-${m.createdAt}`}
                        className="flex flex-col gap-0.5 max-w-[85%]"
                      >
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs font-medium text-red-400 shrink-0">
                            {m.senderEmail ?? "Anonyme"}
                          </span>
                          <span className="text-xs text-zinc-500">
                            {formatMessageTime(m.createdAt)}
                          </span>
                        </div>
                        <p className="text-zinc-200 text-sm break-words">{m.content}</p>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  <form
                    onSubmit={handleSubmit}
                    className="p-4 border-t border-zinc-800 shrink-0 flex gap-2"
                  >
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Écrivez un message…"
                      className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none text-sm"
                      disabled={isSending}
                      maxLength={2000}
                    />
                    <button
                      type="submit"
                      disabled={!inputValue.trim() || isSending}
                      className="rounded-lg bg-red-600 hover:bg-red-500 text-white px-4 py-2.5 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                      aria-label="Envoyer"
                    >
                      <Send className="w-4 h-4" />
                      Envoyer
                    </button>
                  </form>
                </>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
