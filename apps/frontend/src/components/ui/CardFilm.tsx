import { useState } from "react"

// props du composant
interface MovieCardProps {
  id: number
  title: string
  year: number
  rating: number
  imageUrl: string
  genres: string[] // ex: ["Action", "Aventure"]
}

// carte d'un film
export default function MovieCard({
  id: _id,
  title: movieTitle,
  year: movieYear,
  rating: movieRating,
  imageUrl,
  genres: _genres,
}: MovieCardProps) {

  // est-ce que la souris est sur la carte
  const [hovered, setHovered] = useState(false)

    return (
    <div
      className="relative rounded-xl overflow-hidden w-full h-[300px]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >

      {/* image qui couvre toute la carte */}
      <img
        src={imageUrl}
        alt="affiche du film"
        className="w-full h-full object-cover"
      />

      {/* overlay sombre au hover */}
      {hovered && (
        <div className="absolute inset-0 bg-black/50" />
      )}

      {/* gradient sombre en bas */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black to-transparent" />

      {/* titre, année et note en bas */}
      <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between">
        <div>
          <p className="font-bold text-white text-sm">{movieTitle}</p>
          <p className="text-gray-400 text-xs">{movieYear}</p>
        </div>

        {/* étoile + note à droite */}
        <div className="flex items-center gap-1">
          <span className="text-yellow-400 text-sm">★</span>
          <span className="text-white text-sm font-bold">{movieRating}</span>
        </div>
      </div>

    </div>
  )
}
