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
        <p className="text-white">contenu ici</p>
      </div>

    </div>
  );
};

export default MovieHero;
