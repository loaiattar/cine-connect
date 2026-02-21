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
  title: _title,
  year: _year,
  rating: _rating,
  imageUrl,
  genres: _genres,
}: MovieCardProps) {

  // est-ce que la souris est sur la carte
  const [hovered, setHovered] = useState(false)

  console.log(hovered) // temporaire

  return (
    <div className="relative rounded-xl overflow-hidden w-full h-[300px]">

      {/* image qui couvre toute la carte */}
      <img
        src={imageUrl}
        alt="affiche du film"
        className="w-full h-full object-cover"
      />

     
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black to-transparent" />

    </div>
  )
}
