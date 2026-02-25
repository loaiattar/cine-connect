import { createFileRoute, useNavigate } from "@tanstack/react-router";
import MovieHero from "@/components/ui/MovieHero";

export const Route = createFileRoute("/MovieDetailPage")({
  component: MovieDetailPage,
});

// données mockées du film
const mockMovie = {
  title: "Inception",
  year: 2010,
  director: "Christopher Nolan",
  genres: ["DRAME", "ACTION"],
  rating: 4.8,
  posterUrl: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
  synopsis:
    "Dom Cobb est un voleur spécialisé dans l'art de s'introduire dans les rêves des autres pour leur subtiliser les secrets de leur subconscient. Ce talent rare en a fait un joueur très recherché dans le monde trouble de l'espionnage industriel. Mais cette activité lui a coûté cher : il a perdu tout ce qu'il aimait. On lui offre une chance de se racheter : accomplir une mission en apparence impossible, l'inception.",
};

// données mockées des commentaires
const mockComments = [
  {
    id: 1,
    username: "Alice",
    date: "Il y a 2 jours",
    reviewText: "Un film absolument incroyable, je recommande vivement !",
    rating: 5,
  },
  {
    id: 2,
    username: "Bob",
    date: "Il y a 5 jours",
    reviewText: "Scénario complexe mais brillant. DiCaprio est parfait.",
    rating: 4,
  },
  {
    id: 3,
    username: "Clara",
    date: "Il y a 1 semaine",
    reviewText: "Un chef-d'œuvre du cinéma moderne. À voir absolument.",
    rating: 5,
  },
];

function MovieDetailPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900">
      {/* MovieHero avec toutes les props du film */}
      <MovieHero
        title={mockMovie.title}
        year={mockMovie.year}
        director={mockMovie.director}
        genres={mockMovie.genres}
        rating={mockMovie.rating}
        posterUrl={mockMovie.posterUrl}
        onBack={() => navigate({ to: "/" })}
      />

      {/* Section Synopsis */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="text-white font-bold text-2xl mb-3">Synopsis</h2>
        <p className="text-gray-300 leading-relaxed">{mockMovie.synopsis}</p>
      </div>
    </div>
  );
}

export default MovieDetailPage;
