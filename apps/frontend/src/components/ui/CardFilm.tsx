import { useState } from "react"

type MovieCardProps = {
  id: number
  title: string
  year: number
  rating: number
  imageUrl: string
  genres: string[]
}

export default function MovieCard({ title, year, rating, imageUrl, genres }: MovieCardProps) {

  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="relative rounded-xl overflow-hidden w-full h-[360px]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={imageUrl}
        alt="affiche du film"
        className="w-full h-full object-cover"
      />

      {/* assombrit la carte au survol */}
      {hovered && <div className="absolute inset-0 bg-black/50" />}

      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between">
        <div>
          <p className="font-bold text-white text-sm">{title}</p>
          <p className="text-gray-400 text-xs">{year}</p>

          {/* genres visibles au hover */}
          {hovered && (
            <div className="flex flex-wrap gap-1 mt-2">
              {genres.map((genre) => (
                <span key={genre} className="bg-red-500 text-white rounded-full px-3 py-1 text-xs">
                  {genre}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <span className="text-yellow-400 text-sm">★</span>
          <span className="text-white text-sm font-bold">{rating}</span>
        </div>
      </div>

    </div>
  )
}
