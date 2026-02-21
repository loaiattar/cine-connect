// props du composant
interface RateMovieProps {
  onRate: (rating: number) => void
}

// composant pour noter un film
export default function RateMovie({ onRate: _onRate }: RateMovieProps) {
  return (
    // carte avec fond bleu-gris foncé
    <div className="w-full rounded-xl p-4" style={{ backgroundColor: '#1e2a3a' }}>

    </div>
  )
}
