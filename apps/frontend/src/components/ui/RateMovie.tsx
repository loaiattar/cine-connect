import { useState } from "react"

interface RateMovieProps {
  onRate: (rating: number) => void
}

// composant pour noter un film
export default function RateMovie({ onRate: _onRate }: RateMovieProps) {

  // note choisie par l'utilisateur (0 = pas encore noté)
  const [rating, setRating] = useState(0)

  // étoile survolée en ce moment
  const [hovered, setHovered] = useState(0)

  console.log(rating) 

  return (
    <div className="w-full rounded-xl p-4" style={{ backgroundColor: '#1e2a3a' }}>

      <p className="font-bold text-white mb-3">Noter ce film</p>

   
      <div className="flex items-center gap-2">

        {/* couleurs jaune si survolée, grises sinon */}
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={`text-2xl cursor-pointer ${i <= hovered ? 'text-yellow-400' : 'text-gray-400'}`}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(0)}
          >
            ★
          </span>
        ))}

        <span className="text-gray-400 text-sm">Noter</span>
      </div>

    </div>
  )
}
