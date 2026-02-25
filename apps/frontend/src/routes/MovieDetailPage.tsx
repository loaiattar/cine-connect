import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

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
      {/* Bouton Retour */}
      <div className="px-6 pt-6">
        <button
          onClick={() => navigate({ to: "/" })}
          className="flex items-center gap-2 bg-gray-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft size={16} />
          Retour
        </button>
      </div>
    </div>
  );
}

export default MovieDetailPage;
