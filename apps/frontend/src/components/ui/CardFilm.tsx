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
export default function MovieCard({ id: _id, title: _title, year: _year, rating: _rating, imageUrl: _imageUrl, genres: _genres }: MovieCardProps) {
  return (
 
    <div className="relative rounded-xl overflow-hidden w-full">

    </div>
  )
}
