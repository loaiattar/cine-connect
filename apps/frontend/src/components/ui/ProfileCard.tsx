type ProfileCardProps = {
  name?: string;
  initials?: string;
  memberSince?: string;
  bio?: string;
  stats?: {
    filmsRated: number;
    avgRating: number;
    comments: number;
    followers: number;
    following: number;
  };
  isLoading?: boolean;
};

const ProfileCard = ({
  name = "Utilisateur",
  initials = "?",
  memberSince = "...",
  bio = "",
  stats = {
    filmsRated: 0,
    avgRating: 0,
    comments: 0,
    followers: 0,
    following: 0,
  },
  isLoading = false,
}: ProfileCardProps) => {
  if (isLoading) {
    return (
      <div className="bg-black rounded-2xl p-6 w-full max-w-xl animate-pulse">
        {/* Avatar + nom skeleton */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gray-700" />
          <div className="flex flex-col gap-2">
            <div className="h-4 w-32 bg-gray-700 rounded" />
            <div className="h-3 w-24 bg-gray-700 rounded" />
          </div>
        </div>
        {/* Bio skeleton */}
        <div className="h-3 w-full bg-gray-700 rounded mb-2" />
        <div className="h-3 w-3/4 bg-gray-700 rounded mb-4" />
        {/* Stats skeleton */}
        <div className="bg-gray-800 rounded-xl p-4 flex justify-between">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="h-4 w-8 bg-gray-700 rounded" />
              <div className="h-3 w-12 bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black text-white rounded-2xl p-6 w-full max-w-xl">
      {/* Avatar + Nom + Date */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center">
          <span className="text-white text-xl font-bold">{initials}</span>
        </div>
        <div>
          <h2 className="text-white font-bold text-lg">{name}</h2>
          <div className="flex items-center gap-1 text-gray-400 text-sm mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Membre depuis {memberSince}</span>
          </div>
        </div>
      </div>

      {/* Bio */}
      <p className="text-gray-400 text-sm mb-4">{bio}</p>

      {/* Stats */}
      <div className="bg-gray-800 rounded-xl p-4 flex justify-between text-center">
        <div>
          <p className="text-red-500 font-bold">{stats.filmsRated}</p>
          <p className="text-gray-400 text-xs">Films notés</p>
        </div>
        <div>
          <p className="text-yellow-400 font-bold">⭐ {stats.avgRating}</p>
          <p className="text-gray-400 text-xs">Note moyenne</p>
        </div>
        <div>
          <p className="text-blue-400 font-bold">{stats.comments}</p>
          <p className="text-gray-400 text-xs">Commentaires</p>
        </div>
        <div>
          <p className="text-purple-400 font-bold">{stats.followers}</p>
          <p className="text-gray-400 text-xs">Abonnés</p>
        </div>
        <div>
          <p className="text-green-400 font-bold">{stats.following}</p>
          <p className="text-gray-400 text-xs">Abonnements</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
