import { cn, getMovieImageUrl } from "@/lib/utils"

export type PosterCardProps = {
  title: string
  /** TMDB-style path or full URL; passed to {@link getMovieImageUrl}. */
  posterPath: string
  year?: string | number
  /** 0–10 scale (e.g. TMDB). Shown when provided. */
  rating?: number
  className?: string
  imageClassName?: string
  onClick?: () => void
}

/**
 * Standard movie tile for carousels and grids (glass v2).
 */
const shellClass = (interactive: boolean) =>
  cn(
    "group relative block w-full overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-zinc-900/40 text-left outline-none transition-[transform,box-shadow]",
    "focus-visible:ring-2 focus-visible:ring-accent-red focus-visible:ring-offset-2 focus-visible:ring-offset-app-base",
    interactive &&
      "cursor-pointer hover:z-10 hover:scale-[1.02] hover:border-[var(--glass-border-strong)]"
  )

export function PosterCard({
  title,
  posterPath,
  year,
  rating,
  className,
  imageClassName,
  onClick,
}: PosterCardProps) {
  const src = getMovieImageUrl(posterPath, "w342")

  const body = (
    <>
      <div className="aspect-[2/3] w-full overflow-hidden">
        <img
          src={src}
          alt=""
          className={cn(
            "h-full w-full object-cover transition-transform group-hover:scale-105",
            imageClassName
          )}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 space-y-1 p-3">
        <p className="line-clamp-2 text-sm font-semibold text-ink">{title}</p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-ink-secondary">
          {year != null && year !== "" && <span>{year}</span>}
          {rating != null && !Number.isNaN(rating) && (
            <span className="text-ink">{rating.toFixed(1)} ★</span>
          )}
        </div>
      </div>
    </>
  )

  if (onClick) {
    return (
      <button
        type="button"
        data-slot="poster-card"
        onClick={onClick}
        className={cn(shellClass(true), className)}
      >
        {body}
      </button>
    )
  }

  return (
    <div data-slot="poster-card" className={cn(shellClass(false), className)}>
      {body}
    </div>
  )
}
