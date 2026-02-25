import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import MovieHero from "@/components/ui/MovieHero";
import RateMovie from "@/components/ui/RateMovie";
import CommentSection from "@/components/ui/CommentSectionComponent";

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

// utilisateur connecté mocké
const currentUser = "Julie Caty";

function MovieDetailPage() {
  const navigate = useNavigate();

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
        <section className="px-4">
          <CommentSection currentUser={currentUser} />
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
