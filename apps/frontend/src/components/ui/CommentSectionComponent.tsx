// Interface des props du composant ReviewCard
interface ReviewCardProps {
  username: string
  date: string       // ex: "Il y a 2 jours"
  reviewText: string
  rating: number     // de 1 à 5
}

// Composant ReviewCard - structure de base de la carte
export default function ReviewCard({ username: _username, date: _date, reviewText: _reviewText, rating: _rating }: ReviewCardProps) {
  return (
    // Carte avec fond bleu-gris foncé
    <div className="w-full rounded-xl p-4" style={{ backgroundColor: '#1e2a3a' }}>

    </div>
  )
}
