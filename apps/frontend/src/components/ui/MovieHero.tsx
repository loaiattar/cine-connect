import { ArrowLeft, Calendar, Clapperboard, Star } from "lucide-react";

type Props = {
  title: string;
  year: number;
  director: string;
  genres: string[];
  rating: number;
  posterUrl: string;
    "Dom Cobb est un voleur spécialisé dans l'art de s 'introiredans les rêves des autres pour leur subtiliser les secrets de leur subconscient. Ce talent rare en a fait un joueur très recherché dans le monde trouble de l 'espionnage industriel. Mais cette activité lui a coûté cher : il a perdu tout ce qu 'il aimait. On lui offre une chance de se racheter : accomplir une mission en apparence impossible, l 'inception.",
};

const MovieHero = ({ title, year, director, genres, rating, posterUrl, onBack }: Props) => {
  return (
    <div className="relative w-full min-h-[500px] bg-[#0d0d0d] overflow-hidden flex items-center">
      <img src={posterUrl} alt="" className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-40" />
      <div className="absolute inset-0 bg-black/65" />
      <div className="relative z-10 w-full px-10 py-10">
        <button onClick={onBack} className="flex items-center gap-2 bg-[#1a1a1a] ring-1 ring-[#2a2a2a] text-white text-sm px-4 py-2 rounded-[10px] mb-8 hover:bg-[#222]">
          <ArrowLeft size={16} />
          Retour
        </button>
        <div className="flex items-center gap-10">
          <img src={posterUrl} alt={title} className="h-[350px] w-[260px] object-cover rounded-xl shrink-0" />
          <div className="flex flex-col gap-4">
            <h1 className="text-white font-bold text-5xl" style={{ fontFamily: "Georgia, serif" }}>{title}</h1>
            <div className="flex items-center gap-5 text-white text-sm">
              <span className="flex items-center gap-1"><Calendar size={15} />{year}</span>
              <span className="flex items-center gap-1"><Clapperboard size={15} />{director}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {genres.map((g) => (
                <span key={g} className="bg-[#e50914] text-white text-sm px-[18px] py-[6px] rounded-full">{g}</span>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Star size={24} className="text-yellow-400 fill-yellow-400" />
                <span className="text-white font-bold text-4xl">{rating}</span>
              </div>
              <p className="text-gray-400 text-sm mt-1">Note moyenne</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieHero;
