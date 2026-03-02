import { useState } from "react"
import { Clapperboard, MessageCircle, MessageSquare, Star } from "lucide-react"

type User = {
  username: string
  memberSince: string
  bio: string
  filmCount: number
  averageRating: number
  reviewCount: number
  followersCount: number
  followingCount: number
}

type Props = {
  user: User
  onMessage?: () => void
  onFollowToggle?: (user: User, isFollowing: boolean) => void
}

export function UserProfileCard({ user, onMessage, onFollowToggle }: Props) {

  const [isFollowing, setIsFollowing] = useState(false)

  function handleFollowToggle() {
    const next = !isFollowing
    setIsFollowing(next)
    onFollowToggle?.(user, next)
  }

  const initials = user.username.slice(0, 2).toUpperCase()

  return (
    <div className="flex gap-8 bg-zinc-900 rounded-2xl p-8 text-white">

      {/* photo de profil */}
      <div>
        <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center">
          <span className="text-white font-bold text-xl">{initials}</span>
        </div>
      </div>

      {/* infos */}
      <div className="flex-1">

        <p className="text-lg font-bold">{user.username}</p>
        <p className="text-xs text-zinc-500 mt-1">Membre depuis {user.memberSince}</p>
        <p className="text-sm text-zinc-300 mt-2">{user.bio}</p>

        {/* stats */}
        <div className="flex gap-5 text-sm text-zinc-300 mt-3">
          <span className="flex items-center gap-1">
            <Clapperboard className="w-4 h-4" />
            {user.filmCount}
          </span>
          <span className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400" />
            {user.averageRating.toFixed(1)}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            {user.reviewCount}
          </span>
        </div>

        <div className="flex gap-4 text-xs text-zinc-500 mt-2">
          <span><span className="font-bold text-white">{user.followersCount + (isFollowing ? 1 : 0)}</span> abonnés</span>
          <span><span className="font-bold text-white">{user.followingCount}</span> abonnements</span>
        </div>

      </div>

      {/* boutons */}
      <div className="self-center">
        {isFollowing ? (
          <div className="flex flex-col gap-2">
            <button
              onClick={handleFollowToggle}
              className="rounded-lg bg-zinc-700 hover:bg-zinc-600 px-4 py-2 text-sm font-semibold transition-colors"
            >
              Ne plus suivre
            </button>
            <button
              onClick={onMessage}
              className="rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2 text-sm font-semibold flex items-center gap-2 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Message
            </button>
          </div>
        ) : (
          <button
            onClick={handleFollowToggle}
            className="rounded-lg bg-red-600 hover:bg-red-500 px-6 py-2 text-sm font-bold transition-colors"
          >
            Suivre
          </button>
        )}
      </div>

    </div>
  )
}
