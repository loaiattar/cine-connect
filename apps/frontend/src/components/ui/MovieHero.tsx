import { ArrowLeft } from "lucide-react";

type Props = {
  title: string;
  year: number;
  director: string;
  genres: string[];
  rating: number;
  posterUrl: string;
  onBack?: () => void;
};

const MovieHero = ({ title, year, director, genres, rating, posterUrl, onBack }: Props) => {
  return (
    <div className="relative w-full min-h-[500px] bg-[#0d0d0d] overflow-hidden flex items-center">

      {/* Background flouté */}
      <img src={posterUrl} alt="" className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-40" />
      <div className="absolute inset-0 bg-black/65" />

      {/* Contenu */}
      <div className="relative z-10 w-full px-10 py-10">

        {/* Bouton Retour */}
        <button onClick={onBack} className="flex items-center gap-2 bg-[#1a1a1a] ring-1 ring-[#2a2a2a] text-white text-sm px-4 py-2 rounded-[10px] mb-8 hover:bg-[#222]">
          <ArrowLeft size={16} />
          Retour
        </button>

        {/* Main Flexbox */}
        <div className="flex items-center gap-10">

          {/* Affiche */}
          <img src={posterUrl} alt={title} className="h-[350px] w-[260px] object-cover rounded-xl shrink-0" />

          {/* Infos */}
          <div className="flex flex-col gap-4">
            <p className="text-white">infos ici</p>
          </div>

        </div>
      </div>

    </div>
  );
};

export default MovieHero;
