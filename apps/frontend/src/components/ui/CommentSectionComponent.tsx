import { useState } from "react"

interface CommentSectionProps {
  currentUser: string
}

interface MovieComment {
  id: number
  username: string
  date: string
  reviewText: string
  rating: number
}

// carte d'affichage d'un commentaire
export function ReviewCard({ username, date, reviewText, rating }: Omit<MovieComment, "id">) {
  const stars = []
  for (let i = 0; i < rating; i++) {
    stars.push(<span key={i} className="text-yellow-400 text-2xl">★</span>)
  }

  return (
    <div className="w-full rounded-xl p-4" style={{ backgroundColor: '#1e2a3a' }}>
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

// section complète commentaires avec formulaire intégré
export default function CommentSection({ currentUser }: CommentSectionProps) {
  const [comments, setComments] = useState<MovieComment[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formText, setFormText] = useState("")
  const [formRating, setFormRating] = useState(0)
  const [hoveredStar, setHoveredStar] = useState(0)

  function handleSubmit() {
    if (!formText.trim() || formRating === 0) return

    const newComment: MovieComment = {
      id: Date.now(),
      username: currentUser,
      date: "À l'instant",
      reviewText: formText.trim(),
      rating: formRating,
    }

    setComments([...comments, newComment])
    setFormText("")
    setFormRating(0)
    setShowForm(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-bold text-lg">Commentaires</h2>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="bg-red-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          {showForm ? "Annuler" : "Ajouter un commentaire"}
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4 flex flex-col gap-3">
          {/* Sélecteur d'étoiles */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                className={`text-2xl cursor-pointer transition-colors ${i <= (hoveredStar || formRating) ? "text-yellow-400" : "text-gray-600"}`}
                onMouseEnter={() => setHoveredStar(i)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => setFormRating(i)}
              >
                ★
              </span>
            ))}
          </div>
          {/* Champ texte */}
          <textarea
            placeholder="Votre commentaire..."
            value={formText}
            onChange={(e) => setFormText(e.target.value)}
            rows={3}
            className="bg-gray-900 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-red-500 transition-colors resize-none"
          />
          {/* Bouton publier */}
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-red-600 text-white font-bold text-sm px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Publier
          </button>
        </div>
      )}

      {/* Liste commentaires — visible seulement s'il y en a */}
      {comments.length > 0 && (
        <div className="flex flex-col gap-3">
          {comments.map((comment) => (
            <ReviewCard
              key={comment.id}
              username={comment.username}
              date={comment.date}
              reviewText={comment.reviewText}
              rating={comment.rating}
            />
          ))}
        </div>
      )}
    </div>
  )
}
