import { useState } from "react"
import { MessageSquare } from "lucide-react"

type UserProfileCardCompactProps = {
  username: string
  avatarUrl: string
  filmCount: number
  followersCount: number
  isFollowing: boolean
  onFollowToggle: () => void
  onMessage: () => void
}

export function UserProfileCardCompact(props: UserProfileCardCompactProps) {

  const username = props.username
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
        <img src={avatarUrl} alt={username} className="w-16 h-16 rounded-full object-cover shrink-0" />
      ) : (
        <div className="w-16 h-16 rounded-full bg-zinc-700 shrink-0" />
      )}

      {/* nom + stats */}
      <div className="flex-1">
        <p className="font-bold text-sm">{username}</p>
        <p className="text-xs text-zinc-500 mt-1">
          {filmCount} films notés · {followersCount} abonnés
        </p>
      </div>

      {/* boutons */}
      <div className="flex gap-2 shrink-0">
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
