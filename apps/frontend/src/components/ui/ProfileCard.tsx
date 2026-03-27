import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Calendar,
  Clapperboard,
  MessageCircle,
  MessageSquare,
  Star,
  User as UserIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveMediaUrl } from "@/lib/api-origin";
import { RoundedAvatarImage } from "@/components/ui/RoundedAvatarImage";

/** Stats row for `display` variant (read-only profile summary). */
export type ProfileCardDisplayStats = {
  filmsRated: number;
  avgRating: number;
  comments: number;
  followers: number;
  following: number;
};

/** User payload for `interactive` variant (full-width card with follow / message). */
export type ProfileCardInteractiveUser = {
  username: string;
  memberSince: string;
  bio: string;
  filmCount: number;
  averageRating: number;
  reviewCount: number;
  followersCount: number;
  followingCount: number;
};

type ProfileCardDisplayProps = {
  variant?: "display";
  className?: string;
  name?: string;
  initials?: string;
  memberSince?: string;
  bio?: string;
  stats?: ProfileCardDisplayStats;
  isLoading?: boolean;
};

type ProfileCardInteractiveProps = {
  variant: "interactive";
  className?: string;
  user: ProfileCardInteractiveUser;
  userId?: number | null;
  onMessage?: () => void;
};

type ProfileCardCompactProps = {
  variant: "compact";
  className?: string;
  username: string;
  avatarUrl?: string | null;
  filmCount: number;
  followersCount: number;
  isFollowing: boolean;
  userId?: number | null;
  onFollowToggle: () => void;
  onMessage: () => void;
};

export type ProfileCardProps =
  | ProfileCardDisplayProps
  | ProfileCardInteractiveProps
  | ProfileCardCompactProps;

const defaultDisplayStats: ProfileCardDisplayStats = {
  filmsRated: 0,
  avgRating: 0,
  comments: 0,
  followers: 0,
  following: 0,
};

function ProfileCardDisplay({
  className,
  name = "Utilisateur",
  initials = "?",
  memberSince = "...",
  bio = "",
  stats = defaultDisplayStats,
  isLoading = false,
}: Omit<ProfileCardDisplayProps, "variant">) {
  if (isLoading) {
    return (
      <div
        className={cn(
          "w-full max-w-xl animate-pulse rounded-2xl bg-black p-6",
          className
        )}
      >
        <div className="mb-4 flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-gray-700" />
          <div className="flex flex-col gap-2">
            <div className="h-4 w-32 rounded bg-gray-700" />
            <div className="h-3 w-24 rounded bg-gray-700" />
          </div>
        </div>
        <div className="mb-2 h-3 w-full rounded bg-gray-700" />
        <div className="mb-4 h-3 w-3/4 rounded bg-gray-700" />
        <div className="flex justify-between rounded-xl bg-gray-800 p-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="h-4 w-8 rounded bg-gray-700" />
              <div className="h-3 w-12 rounded bg-gray-700" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("w-full max-w-xl rounded-2xl bg-black p-6 text-white", className)}
    >
      <div className="mb-4 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600">
          <span className="text-xl font-bold text-white">{initials}</span>
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">{name}</h2>
          <div className="mt-1 flex items-center gap-1 text-sm text-gray-400">
            <Calendar className="h-4 w-4" aria-hidden />
            <span>Membre depuis {memberSince}</span>
          </div>
        </div>
      </div>

      <p className="mb-4 text-sm text-gray-400">{bio}</p>

      <div className="flex justify-between rounded-xl bg-gray-800 p-4 text-center">
        <div>
          <p className="font-bold text-red-500">{stats.filmsRated}</p>
          <p className="text-xs text-gray-400">Films notés</p>
        </div>
        <div>
          <p className="font-bold text-yellow-400">⭐ {stats.avgRating}</p>
          <p className="text-xs text-gray-400">Note moyenne</p>
        </div>
        <div>
          <p className="font-bold text-blue-400">{stats.comments}</p>
          <p className="text-xs text-gray-400">Commentaires</p>
        </div>
        <div>
          <p className="font-bold text-purple-400">{stats.followers}</p>
          <p className="text-xs text-gray-400">Abonnés</p>
        </div>
        <div>
          <p className="font-bold text-green-400">{stats.following}</p>
          <p className="text-xs text-gray-400">Abonnements</p>
        </div>
      </div>
    </div>
  );
}

function ProfileCardInteractive({
  className,
  user,
  userId,
  onMessage,
}: Omit<ProfileCardInteractiveProps, "variant">) {
  const [isFollowing, setIsFollowing] = useState(false);
  const initials = user.username.slice(0, 2).toUpperCase();

  return (
    <div
      className={cn(
        "flex gap-8 rounded-2xl bg-zinc-900 p-8 text-white",
        className
      )}
    >
      <div>
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-600">
          <span className="text-xl font-bold text-white">{initials}</span>
        </div>
      </div>

      <div className="flex-1">
        <p className="text-lg font-bold">{user.username}</p>
        <p className="mt-1 text-xs text-zinc-500">Membre depuis {user.memberSince}</p>
        <p className="mt-2 text-sm text-zinc-300">{user.bio}</p>

        <div className="mt-3 flex gap-5 text-sm text-zinc-300">
          <span className="flex items-center gap-1">
            <Clapperboard className="h-4 w-4" />
            {user.filmCount}
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-400" />
            {user.averageRating.toFixed(1)}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            {user.reviewCount}
          </span>
        </div>

        <div className="mt-2 flex gap-4 text-xs text-zinc-500">
          <span>
            <span className="font-bold text-white">
              {user.followersCount + (isFollowing ? 1 : 0)}
            </span>{" "}
            abonnés
          </span>
          <span>
            <span className="font-bold text-white">{user.followingCount}</span> abonnements
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 self-center">
        {userId != null && userId > 0 && (
          <Link
            to="/profile/$userId"
            params={{ userId: String(userId) }}
            className="flex items-center gap-2 rounded-lg bg-zinc-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-600"
          >
            <UserIcon className="h-4 w-4" />
            Voir le profil
          </Link>
        )}
        {isFollowing ? (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setIsFollowing(!isFollowing)}
              className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-semibold transition-colors hover:bg-zinc-600"
            >
              Ne plus suivre
            </button>
            <button
              type="button"
              onClick={onMessage}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold transition-colors hover:bg-blue-500"
            >
              <MessageSquare className="h-4 w-4" />
              Message
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsFollowing(!isFollowing)}
            className="rounded-lg bg-red-600 px-6 py-2 text-sm font-bold transition-colors hover:bg-red-500"
          >
            Suivre
          </button>
        )}
      </div>
    </div>
  );
}

function ProfileCardCompact({
  className,
  username,
  avatarUrl,
  filmCount,
  followersCount,
  isFollowing,
  userId,
  onFollowToggle,
  onMessage,
}: Omit<ProfileCardCompactProps, "variant">) {
  const trimmedAvatar = avatarUrl?.trim() ?? "";
  const resolvedAvatar = resolveMediaUrl(trimmedAvatar || null);

  return (
    <div
      className={cn(
        "flex items-center gap-5 rounded-xl bg-zinc-900 px-6 py-5 text-white",
        className
      )}
    >
      {resolvedAvatar ? (
        <RoundedAvatarImage
          src={resolvedAvatar}
          alt={username}
          sizeClassName="h-16 w-16"
          ringClassName=""
        />
      ) : (
        <div className="h-16 w-16 shrink-0 rounded-full bg-zinc-700" />
      )}

      <div className="min-w-0 flex-1">
        {userId != null && userId > 0 ? (
          <Link
            to="/profile/$userId"
            params={{ userId: String(userId) }}
            className="block truncate text-sm font-bold text-white transition-colors hover:text-red-400"
          >
            {username}
          </Link>
        ) : (
          <p className="text-sm font-bold">{username}</p>
        )}
        <p className="mt-1 text-xs text-zinc-500">
          {filmCount} films notés · {followersCount} abonnés
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
        {userId != null && userId > 0 && (
          <Link
            to="/profile/$userId"
            params={{ userId: String(userId) }}
            className="flex items-center gap-1 rounded-lg bg-zinc-700 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-600"
          >
            <UserIcon className="h-4 w-4" />
            Voir le profil
          </Link>
        )}
        {isFollowing ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onMessage}
              className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold transition-colors hover:bg-blue-500"
            >
              <MessageSquare className="h-4 w-4" />
              Message
            </button>
            <button
              type="button"
              onClick={onFollowToggle}
              className="rounded-lg bg-zinc-700 px-3 py-2 text-xs font-semibold transition-colors hover:bg-zinc-600"
            >
              Ne plus suivre
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onFollowToggle}
            className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold transition-colors hover:bg-red-500"
          >
            Suivre
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Profile summary / actions. Use `variant` to pick layout:
 * - `display` (default): read-only card with optional loading skeleton
 * - `interactive`: wide card with local follow toggle + message
 * - `compact`: single row; follow state is controlled via `isFollowing` + `onFollowToggle`
 */
export function ProfileCard(props: ProfileCardProps) {
  if (props.variant === "interactive") {
    return (
      <ProfileCardInteractive
        className={props.className}
        user={props.user}
        userId={props.userId}
        onMessage={props.onMessage}
      />
    );
  }
  if (props.variant === "compact") {
    return (
      <ProfileCardCompact
        className={props.className}
        username={props.username}
        avatarUrl={props.avatarUrl}
        filmCount={props.filmCount}
        followersCount={props.followersCount}
        isFollowing={props.isFollowing}
        userId={props.userId}
        onFollowToggle={props.onFollowToggle}
        onMessage={props.onMessage}
      />
    );
  }
  return (
    <ProfileCardDisplay
      className={props.className}
      name={props.name}
      initials={props.initials}
      memberSince={props.memberSince}
      bio={props.bio}
      stats={props.stats}
      isLoading={props.isLoading}
    />
  );
}
