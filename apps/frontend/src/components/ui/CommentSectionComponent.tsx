interface ReviewCardProps {
  username: string
  date: string
  reviewText: string
  rating: number
}

// carte d'un avis utilisateur
export default function ReviewCard({ username, date, reviewText, rating }: ReviewCardProps) {

  // je crée un tableau pour afficher les étoiles
  const stars = []
  for (let i = 0; i < rating; i++) {
    stars.push(<span key={i} className="text-yellow-400 text-2xl">★</span>)
  }

  return (
    <div className="w-full rounded-xl p-4" style={{ backgroundColor: '#1e2a3a' }}>

      {/* étoiles en haut à droite */}
      <div className="flex justify-end mb-2">
        {stars}
      </div>

    
      <div className="flex gap-3">

       
        <div className="w-10 h-10 rounded-full bg-gray-500" />

        <div>
          <p className="font-bold text-white">{username}</p>
          <p className="text-sm text-gray-400">{date}</p>
          <p className="text-gray-200 text-sm mt-1">{reviewText}</p>
        </div>

      </div>
    </div>
  )
}
