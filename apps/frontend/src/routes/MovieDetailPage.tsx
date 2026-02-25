import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
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

  // liste des commentaires — vide au départ
  const [comments, setComments] = useState<MovieComment[]>([]);
  const [showForm, setShowForm] = useState(false);

  // champs du formulaire
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
    <div className="min-h-screen bg-gray-900">
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

      {/* Contenu principal centré */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Synopsis */}
        <section className="py-8 border-b border-gray-700">
          <h2 className="text-white font-bold text-2xl mb-3">Synopsis</h2>
          <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
            {mockMovie.synopsis}
          </p>
        </section>

        {/* Section RateMovie */}
        <section className="py-8 border-b border-gray-700">
          <RateMovie onRate={(_note) => {}} />
        </section>

        {/* Section Commentaires */}
        <section className="py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <h2 className="text-white font-bold text-2xl">Commentaires</h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-[#e50914] text-white text-sm px-4 py-2 rounded-lg hover:bg-red-700 transition-colors w-full sm:w-auto"
            >
              {showForm ? "Annuler" : "Ajouter un commentaire"}
            </button>
          </div>

          {/* Formulaire d'ajout */}
          {showForm && (
            <div className="bg-gray-800 rounded-xl p-4 mb-6 flex flex-col gap-3">
              <input
                type="text"
                placeholder="Votre nom"
                value={formUsername}
                onChange={(e) => setFormUsername(e.target.value)}
                className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-red-500"
              />
              <textarea
                placeholder="Votre commentaire..."
                value={formText}
                onChange={(e) => setFormText(e.target.value)}
                rows={3}
                className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-red-500 resize-none"
              />
              {/* Sélecteur d'étoiles */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={i}
                    className={`text-2xl cursor-pointer ${i <= (hoveredStar || formRating) ? "text-yellow-400" : "text-gray-500"}`}
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
                className="bg-[#e50914] text-white font-bold text-sm px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Publier
              </button>
            </div>
          )}

          {/* Liste des commentaires — visible seulement s'il y en a */}
          {comments.length > 0 && (
            <div className="flex flex-col gap-4">
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
      <div className="w-full bg-[#e50914] py-12 mt-4 flex justify-center items-center">
        <button className="bg-white text-[#e50914] font-bold text-lg px-10 py-3 rounded-xl hover:bg-gray-100 transition-colors">
          Ouvrir le chat
        </button>
      </div>
    </div>
  );
}

export default MovieDetailPage;
