import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { moviesService, type MovieCommentRow } from "@/service/movies.service";
import { useMovieCommentSocket } from "@/lib/socket";
import { Loader2 } from "lucide-react";

export interface CommentSectionProps {
  movieId: number;
  isLoggedIn: boolean;
  currentUser: string;
}

interface ReviewCardProps {
  username: string;
  date: string;
  reviewText: string;
  rating?: number;
}

export function ReviewCard({ username, date, reviewText, rating = 0 }: ReviewCardProps) {
  const stars = [];
  for (let i = 0; i < rating; i++) {
    stars.push(<span key={i} className="text-yellow-400 text-2xl">★</span>);
  }

  return (
    <div className="w-full rounded-xl p-4" style={{ backgroundColor: "#1e2a3a" }}>
      {stars.length > 0 && <div className="flex justify-end mb-2">{stars}</div>}
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-500 shrink-0" />
        <div className="min-w-0">
          <p className="font-bold text-white">{username}</p>
          <p className="text-sm text-gray-400">{date}</p>
          <p className="text-gray-200 text-sm mt-1">{reviewText}</p>
        </div>
      </div>
    </div>
  );
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  try {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString("fr-FR", { dateStyle: "medium" });
  } catch {
    return value;
  }
}

function toDisplayComment(row: MovieCommentRow, currentUser: string): ReviewCardProps & { id: number } {
  const email = row.userEmail ?? null;
  const name = row.userName ?? email ?? "Anonyme";
  const isYou = currentUser && (email === currentUser || name === currentUser);
  return {
    id: row.id,
    username: isYou ? `${name} (vous)` : name,
    date: formatDate(row.createdAt),
    reviewText: row.comment,
    rating: 0,
  };
}

function getCommentsPayload(raw: unknown): MovieCommentRow[] {
  if (Array.isArray(raw)) return raw as MovieCommentRow[];
  if (raw && typeof raw === "object" && "data" in raw && Array.isArray((raw as { data: unknown }).data)) {
    return (raw as { data: MovieCommentRow[] }).data;
  }
  return [];
}

export default function CommentSection({ movieId, isLoggedIn, currentUser }: CommentSectionProps) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formText, setFormText] = useState("");

  const { data: commentsRaw, isLoading } = useQuery({
    queryKey: ["movie", "comments", movieId],
    queryFn: () => moviesService.getMovieComments(movieId),
    enabled: Number.isInteger(movieId) && movieId > 0,
  });

  const invalidateComments = () => {
    queryClient.invalidateQueries({ queryKey: ["movie", "comments", movieId] });
  };

  useMovieCommentSocket(movieId, invalidateComments);

  const addCommentMutation = useMutation({
    mutationFn: (text: string) => moviesService.addComment(movieId, text),
    onSuccess: () => {
      invalidateComments();
      setFormText("");
      setShowForm(false);
    },
  });

  const comments = getCommentsPayload(commentsRaw);
  const displayComments = comments.map((row) => toDisplayComment(row, currentUser));

  function handleSubmit() {
    const text = formText.trim();
    if (!text || !isLoggedIn) return;
    addCommentMutation.mutate(text);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-white font-bold text-lg">Commentaires</h2>
        {isLoggedIn && (
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="bg-red-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            {showForm ? "Annuler" : "Ajouter un commentaire"}
          </button>
        )}
        {!isLoggedIn && (
          <p className="text-gray-400 text-sm">Connectez-vous pour commenter.</p>
        )}
      </div>

      {showForm && isLoggedIn && (
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4 flex flex-col gap-3">
          <textarea
            placeholder="Votre commentaire..."
            value={formText}
            onChange={(e) => setFormText(e.target.value)}
            rows={3}
            className="bg-gray-900 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-red-500 transition-colors resize-none"
            disabled={addCommentMutation.isPending}
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!formText.trim() || addCommentMutation.isPending}
            className="bg-red-600 text-white font-bold text-sm px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addCommentMutation.isPending ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Publication…
              </span>
            ) : (
              "Publier"
            )}
          </button>
          {addCommentMutation.isError && (
            <p className="text-red-400 text-sm">
              {addCommentMutation.error && typeof addCommentMutation.error === "object" && "message" in addCommentMutation.error
                ? String((addCommentMutation.error as { message: string }).message)
                : "Erreur lors de la publication"}
            </p>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" aria-hidden />
        </div>
      ) : (
        displayComments.length > 0 && (
          <div className="flex flex-col gap-3">
            {displayComments.map((c) => (
              <ReviewCard
                key={c.id}
                username={c.username}
                date={c.date}
                reviewText={c.reviewText}
                rating={c.rating}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
}
