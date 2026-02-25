import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import MovieHero from "@/components/ui/MovieHero";
import RateMovie from "@/components/ui/RateMovie";
import ReviewCard from "@/components/ui/CommentSectionComponent";

export const Route = createFileRoute("/MovieDetailPage")({
  component: MovieDetailPage,
});

// TypeScript interfaces
interface Film {
  title: string;
  year: number;
  director: string;
  genres: string[];
  rating: number;
  posterUrl: string;
  synopsis: string;
}

interface MovieComment {
  id: number;
  username: string;
  date: string;
  reviewText: string;
  rating: number;
}

// données mockées du film
const mockMovie: Film = {
  title: "Inception",
  year: 2010,
  director: "Christopher Nolan",
  genres: ["DRAME", "ACTION"],
  rating: 4.8,
  posterUrl: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
  synopsis:
    "Dom Cobb est un voleur spécialisé dans l'art de s'introduire dans les rêves des autres pour leur subtiliser les secrets de leur subconscient. Ce talent rare en a fait un joueur très recherché dans le monde trouble de l'espionnage industriel. Mais cette activité lui a coûté cher : il a perdu tout ce qu'il aimait. On lui offre une chance de se racheter : accomplir une mission en apparence impossible, l'inception.",
};

function MovieDetailPage() {
  const navigate = useNavigate();

  const [comments, setComments] = useState<MovieComment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formUsername, setFormUsername] = useState("");
  const [formText, setFormText] = useState("");
  const [formRating, setFormRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);

  function handleSubmit() {
    if (!formUsername.trim() || !formText.trim() || formRating === 0) return;

    const newComment: MovieComment = {
      id: Date.now(),
      username: formUsername.trim(),
      date: "À l'instant",
      reviewText: formText.trim(),
      rating: formRating,
    };

    setComments([...comments, newComment]);
    setFormUsername("");
    setFormText("");
    setFormRating(0);
    setShowForm(false);
  }

  return (
    <div className="min-h-screen bg-gray-950">

      {/* Bouton Retour au-dessus du hero */}
      <div className="max-w-md mx-auto px-4 pt-4">
        <button
          onClick={() => navigate({ to: "/" })}
          className="flex items-center gap-2 bg-gray-900 border border-gray-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft size={14} />
          Retour
        </button>
      </div>

      {/* MovieHero */}
      <MovieHero
        title={mockMovie.title}
        year={mockMovie.year}
        director={mockMovie.director}
        genres={mockMovie.genres}
        rating={mockMovie.rating}
        posterUrl={mockMovie.posterUrl}
        onBack={() => navigate({ to: "/" })}
      />

      {/* Contenu principal — format mobile centré */}
      <div className="w-full max-w-md mx-auto space-y-6 py-6">

        {/* Section Synopsis */}
        <section className="px-4">
          <h2 className="text-white font-bold text-lg mb-3">Synopsis</h2>
          <p className="text-gray-300 leading-relaxed text-sm">
            {mockMovie.synopsis}
          </p>
        </section>

        {/* Section RateMovie */}
        <section className="bg-slate-800 border border-slate-600 rounded-xl px-4 py-4">
          <RateMovie onRate={(_note) => {}} />
        </section>

        {/* Section Commentaires */}
        <section className="px-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-bold text-lg">Commentaires</h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-red-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              {showForm ? "Annuler" : "Ajouter un commentaire"}
            </button>
          </div>

          {showForm && (
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4 flex flex-col gap-3">
              <input
                type="text"
                placeholder="Votre nom"
                value={formUsername}
                onChange={(e) => setFormUsername(e.target.value)}
                className="bg-gray-900 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-red-500 transition-colors"
              />
              <textarea
                placeholder="Votre commentaire..."
                value={formText}
                onChange={(e) => setFormText(e.target.value)}
                rows={3}
                className="bg-gray-900 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-red-500 transition-colors resize-none"
              />
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={i}
                    className={`text-2xl cursor-pointer transition-colors ${i <= (hoveredStar || formRating) ? "text-yellow-400" : "text-gray-600"}`}
                    onMouseEnter={() => setHoveredStar(i)}
                    onMouseLeave={() => setHoveredStar(0)}
                    onClick={() => setFormRating(i)}
                  >
                    ★
                  </span>
                ))}
              </div>
              <button
                onClick={handleSubmit}
                className="bg-red-600 text-white font-bold text-sm px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Publier
              </button>
            </div>
          )}

          {comments.length > 0 && (
            <div className="flex flex-col gap-3">
              {comments.map((comment) => (
                <ReviewCard
                  key={comment.id}
                  username={comment.username}
                  date={comment.date}
                  reviewText={comment.reviewText}
                  rating={comment.rating}
                />
              ))}
            </div>
          )}
        </section>

      </div>

      {/* Bloc CTA Ouvrir le chat */}
      <div className="max-w-md mx-auto px-4 pb-8">
        <div className="bg-red-950 border border-red-800 rounded-xl p-8">
          <button className="bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg px-6 py-2 mx-auto block transition-colors">
            Ouvrir le chat
          </button>
        </div>
      </div>

    </div>
  );
}

export default MovieDetailPage;
