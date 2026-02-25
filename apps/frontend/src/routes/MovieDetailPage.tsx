import { createFileRoute, useNavigate } from "@tanstack/react-router";
import MovieHero from "@/components/ui/MovieHero";
import RateMovie from "@/components/ui/RateMovie";
import ReviewCard from "@/components/ui/CommentSectionComponent";

export const Route = createFileRoute("/MovieDetailPage")({
  component: MovieDetailPage,
});

// interfaces TypeScript
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

// données mockées des commentaires
const mockComments: MovieComment[] = [
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
            <button className="bg-[#e50914] text-white text-sm px-4 py-2 rounded-lg hover:bg-red-700 transition-colors w-full sm:w-auto">
              Ajouter un commentaire
            </button>
          </div>
          <div className="flex flex-col gap-4">
            {mockComments.map((comment) => (
              <ReviewCard
                key={comment.id}
                username={comment.username}
                date={comment.date}
                reviewText={comment.reviewText}
                rating={comment.rating}
              />
            ))}
          </div>
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
