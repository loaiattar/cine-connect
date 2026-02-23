import { useState } from "react";

type RateMovieProps = {
  onRate: (rating: number) => void;
};

export default function RateMovie({ onRate }: RateMovieProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);

  // quand on clique : si c'est la même étoile on remet à 0
  function handleClick(i: number) {
    const newRating = i === rating ? 0 : i;
    setRating(newRating);
    setHovered(0);
    onRate(newRating);
  }

  // quand on survole, on montre le hover, sinon on montre la note
  function getColor(i: number) {
    if (hovered > 0) {
      return i <= hovered ? "text-yellow-400" : "text-gray-400";
    }
    return i <= rating ? "text-yellow-400" : "text-gray-400";
  }

  return (
    <div
      className="w-full rounded-xl p-4"
      style={{ backgroundColor: "#1e2a3a" }}
    >
      <p className="font-bold text-white mb-3">Noter ce film</p>

      <div className="flex items-center gap-2">
        {/* j'affiche 5 étoiles cliquables */}
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={`text-2xl cursor-pointer ${getColor(i)}`}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => handleClick(i)}
          >
            ★
          </span>
        ))}

        <span className="text-gray-400 text-sm">Noter</span>
      </div>
    </div>
  );
}
