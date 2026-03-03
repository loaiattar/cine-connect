import { useState, useEffect } from "react";

/** userRating from API is 1–10; we display 5 stars (1–5). onRate receives 1–5; parent sends ×2 for API. */
export type RateMovieProps = {
  average?: number;
  count?: number;
  userRating?: number | null;
  canRate?: boolean;
  onRate: (stars: number) => void;
};

export default function RateMovie({ average, count, userRating, canRate = true, onRate }: RateMovieProps) {
  const starsFromApi = userRating != null ? Math.round(userRating / 2) : 0;
  const [rating, setRating] = useState(starsFromApi);
  const [hovered, setHovered] = useState(0);

  useEffect(() => {
    setRating(starsFromApi);
  }, [starsFromApi]);

  function handleClick(i: number) {
    if (!canRate) return;
    const newRating = i === rating ? 0 : i;
    setRating(newRating);
    setHovered(0);
    onRate(newRating);
  }

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

      {(average != null && count != null) && (
        <p className="text-gray-400 text-sm mb-2">
          Moyenne : <span className="text-white font-medium">{average.toFixed(1)}</span>/10
          {" · "}
          <span className="text-white font-medium">{count}</span> avis
        </p>
      )}

      {userRating != null && (
        <p className="text-yellow-400/90 text-sm mb-2">Votre note : {userRating}/10</p>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={`text-2xl ${canRate ? "cursor-pointer" : "cursor-not-allowed opacity-70"} ${getColor(i)}`}
            onMouseEnter={() => canRate && setHovered(i)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => handleClick(i)}
            role={canRate ? "button" : undefined}
            aria-label={canRate ? `Noter ${i} sur 5` : undefined}
          >
            ★
          </span>
        ))}
        <span className="text-gray-400 text-sm">
          {canRate ? "Cliquez pour noter (1–5 → enregistré sur 10)" : "Connectez-vous pour noter"}
        </span>
      </div>
    </div>
  );
}
