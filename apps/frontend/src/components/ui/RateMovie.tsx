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
      return i <= hovered ? "text-accent-red" : "text-ink-muted";
    }
    return i <= rating ? "text-accent-red" : "text-ink-muted";
  }

  return (
    <div className="w-full">
      <p className="mb-3 font-bold text-ink">Noter ce film</p>

      {(average != null && count != null) && (
        <p className="mb-2 text-sm text-ink-secondary">
          Moyenne : <span className="font-medium text-ink">{average.toFixed(1)}</span>/10
          {" · "}
          <span className="font-medium text-ink">{count}</span> avis
        </p>
      )}

      {userRating != null && (
        <p className="mb-2 text-sm text-accent-red-hover">Votre note : {userRating}/10</p>
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
        <span className="text-sm text-ink-muted">
          {canRate ? "Cliquez pour noter (1–5 → enregistré sur 10)" : "Connectez-vous pour noter"}
        </span>
      </div>
    </div>
  );
}
