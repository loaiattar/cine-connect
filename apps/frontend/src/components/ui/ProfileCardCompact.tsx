import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { MessageSquare, User } from "lucide-react"

type UserProfileCardCompactProps = {
  username: string
  avatarUrl: string
  filmCount: number
  followersCount: number
  isFollowing: boolean
  userId?: number | null
  onFollowToggle: () => void
  onMessage: () => void
}

export function UserProfileCardCompact(props: UserProfileCardCompactProps) {

  const avatarUrl = props.avatarUrl
  const filmCount = props.filmCount
  const followersCount = props.followersCount
  const [isFollowing, setIsFollowing] = useState(props.isFollowing)
  const onMessage = props.onMessage

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing)
    props.onFollowToggle()
  }

  return (
    <div className="flex items-center gap-5 bg-zinc-900 rounded-xl px-6 py-5 text-white">

      {/* avatar */}
      {avatarUrl ? (
        <img src={avatarUrl} alt={props.username} className="w-16 h-16 rounded-full object-cover shrink-0" />
      ) : (
        <div className="w-16 h-16 rounded-full bg-zinc-700 shrink-0" />
      )}

      {/* nom + stats */}
      <div className="flex-1 min-w-0">
        {props.userId != null && props.userId > 0 ? (
          <Link
            to="/profile/$userId"
            params={{ userId: String(props.userId) }}
            className="font-bold text-sm text-white hover:text-red-400 transition-colors block truncate"
          >
            {props.username}
          </Link>
        ) : (
          <p className="font-bold text-sm">{props.username}</p>
        )}
        <p className="text-xs text-zinc-500 mt-1">
          {filmCount} films notés · {followersCount} abonnés
        </p>
      </div>

      {/* boutons */}
      <div className="flex flex-col sm:flex-row gap-2 shrink-0 items-end sm:items-center">
        {props.userId != null && props.userId > 0 && (
          <Link
            to="/profile/$userId"
            params={{ userId: String(props.userId) }}
            className="flex items-center gap-1 bg-zinc-700 hover:bg-zinc-600 px-3 py-2 rounded-lg text-xs font-semibold transition-colors text-white"
          >
            <User className="w-4 h-4" />
            Voir le profil
          </Link>
        )}
        {isFollowing ? (
          <div className="flex gap-2">
            <button
              onClick={onMessage}
              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Message
            </button>
            <button
              onClick={handleFollowToggle}
              className="bg-zinc-700 hover:bg-zinc-600 px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
            >
              Ne plus suivre
            </button>
          </div>
        ) : (
          <button
            onClick={handleFollowToggle}
            className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg text-xs font-bold transition-colors"
          >
            Suivre
          </button>
        )}
      </div>

    </div>
  )
}
