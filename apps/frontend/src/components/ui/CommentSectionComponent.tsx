// Interface des props du composant
interface ReviewCardProps {
  username: string
  date: string       // ex: "Il y a 2 jours"
  reviewText: string
  rating: number     // de 1 à 5
}

// Composant ReviewCard
export default function ReviewCard({ username, date, reviewText, rating }: ReviewCardProps) {
  return (
    // Carte avec fond bleu-gris foncé
    <div className="w-full rounded-xl p-4" style={{ backgroundColor: '#1e2a3a' }}>

      {/* Étoiles en haut à droite */}
      <div className="flex justify-end mb-2">
        {Array.from({ length: rating }).map((_, i) => (
          <span key={i} className="text-yellow-400 text-2xl">★</span>
        ))}
      </div>

      {/* Zone avatar + infos utilisateur */}
      <div className="flex items-start gap-3">

        {/* Avatar circulaire gris */}
        <div className="w-10 h-10 rounded-full bg-gray-500 shrink-0" />

        {/* Nom, date et texte de l'avis */}
        <div>
          <p className="font-bold text-white">{username}</p>
          <p className="text-sm text-gray-400 mb-1">{date}</p>
          <p className="text-gray-200 text-sm leading-relaxed">{reviewText}</p>
        </div>

      </div>
    </div>
  )
}
