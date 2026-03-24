import { ArrowLeft, Calendar, Clapperboard, Star } from "lucide-react";
import { PillTag } from "@/components/glass";

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
    <div className="relative flex min-h-[500px] w-full items-center overflow-hidden bg-app-base">
      <img
        src={posterUrl}
        alt=""
        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-xl"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-black/80 to-[var(--scrim-from)]"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-transparent to-zinc-950/40"
        aria-hidden
      />
      <div className="relative z-10 w-full px-6 py-10 sm:px-10">
        <button
          type="button"
          onClick={onBack}
          className="mb-8 inline-flex items-center gap-2 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-2 text-sm text-ink backdrop-blur-[var(--glass-blur)] transition-colors hover:border-[var(--glass-border-strong)] hover:bg-[var(--glass-bg-elevated)]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Retour
        </button>
        <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:gap-10">
          <img
            src={posterUrl}
            alt=""
            className="h-[280px] w-[187px] shrink-0 rounded-2xl object-cover ring-1 ring-[var(--glass-border)] sm:h-[350px] sm:w-[260px]"
          />
          <div
            className="flex max-w-2xl flex-col gap-4 rounded-[var(--radius-glass)] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-5 text-center backdrop-blur-[var(--glass-blur)] sm:p-6 lg:text-left"
          >
            <h1 className="text-4xl font-bold text-ink sm:text-5xl">{title}</h1>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-ink-secondary lg:justify-start">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" aria-hidden />
                {year}
              </span>
              <span className="flex items-center gap-1">
                <Clapperboard className="h-4 w-4" aria-hidden />
                {director}
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
              {genres.map((g) => (
                <PillTag key={g} variant="accent">
                  {g}
                </PillTag>
              ))}
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 lg:justify-start">
                <Star className="h-6 w-6 fill-ink-secondary text-ink-secondary sm:h-8 sm:w-8" aria-hidden />
                <span className="text-4xl font-bold text-ink">{rating}</span>
              </div>
              <p className="mt-1 text-sm text-ink-secondary">Note moyenne</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieHero;
