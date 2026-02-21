import { useState } from "react"

interface RateMovieProps {
  onRate: (rating: number) => void
}

// composant pour noter un film
export default function RateMovie({ onRate: _onRate }: RateMovieProps) {

  // note choisie par l'utilisateur (0 = pas encore noté)
  const [rating, setRating] = useState(0)

  const [hovered, setHovered] = useState(0)

  console.log(rating, hovered) 

  return (
   
    <div className="w-full rounded-xl p-4" style={{ backgroundColor: '#1e2a3a' }}>

      Section Title
      <p className="font-bold text-white mb-3">Noter ce film</p>

    </div>
  )
}
