// Interface des props du composant ReviewCard
interface ReviewCardProps {
  username: string
  date: string       // ex: "Il y a 2 jours"
  reviewText: string
  rating: number     // de 1 à 5
}

// Composant ReviewCard - structure de base de la carte
export default function ReviewCard({ username: _username, date: _date, reviewText: _reviewText, rating }: ReviewCardProps) {
  return (
    // Carte avec fond bleu-gris foncé
    <div className="w-full rounded-xl p-4" style={{ backgroundColor: '#1e2a3a' }}>

      {/* Étoiles jaunes alignées en haut à droite */}
      <div className="flex justify-end mb-2">
        {Array.from({ length: rating }).map((_, i) => (
          <span key={i} className="text-yellow-400 text-2xl">★</span>
        ))}
      </div>

    </div>
  )
}
