import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProfileCard from "@/components/ui/InfoProfileCard";
import { UserProfileCard } from "@/components/ui/ProfileCard1";
import MovieCard from "@/components/ui/CardFilm";

export const Route = createFileRoute("/profil")({
  component: ProfilPage,
});

type FollowUser = {
  username: string;
  memberSince: string;
  bio: string;
  filmCount: number;
  averageRating: number;
  reviewCount: number;
  followersCount: number;
  followingCount: number;
};

type FavoriteFilm = {
  id: number;
  title: string;
  year: number;
  rating: number;
  imageUrl: string;
  genres: string[];
};

// TODO: remplacer par -> GET /api/users/:id
const userProfile = {
  name: "Marie Dupont",
  initials: "MD",
  memberSince: "janvier 2023",
  bio: "Passionnée de cinéma indépendant et de films noirs.",
  stats: {
    filmsRated: 142,
    avgRating: 7.4,
    comments: 38,
    followers: 94,
    following: 57,
  },
};

// TODO: remplacer par -> GET /api/users/:id/followers
const followers: FollowUser[] = [
  {
    username: "Lucas Martin",
    memberSince: "mars 2022",
    bio: "Fan de science-fiction et de thrillers psychologiques.",
    filmCount: 210,
    averageRating: 7.1,
    reviewCount: 52,
    followersCount: 130,
    followingCount: 45,
  },
  {
    username: "Sophie Leclerc",
    memberSince: "juin 2023",
    bio: "Cinéphile du dimanche, amatrice de comédies françaises.",
    filmCount: 88,
    averageRating: 6.8,
    reviewCount: 14,
    followersCount: 22,
    followingCount: 31,
  },
  {
    username: "Tom Renard",
    memberSince: "octobre 2021",
    bio: "Réalisateur amateur, critique féroce mais juste.",
    filmCount: 305,
    averageRating: 8.0,
    reviewCount: 97,
    followersCount: 210,
    followingCount: 78,
  },
];

// TODO: remplacer par -> GET /api/users/:id/following
const following: FollowUser[] = [
  {
    username: "Camille Noir",
    memberSince: "février 2020",
    bio: "Experte des films d'horreur et des classiques du muet.",
    filmCount: 512,
    averageRating: 7.9,
    reviewCount: 143,
    followersCount: 380,
    followingCount: 60,
  },
  {
    username: "Julien Vasseur",
    memberSince: "avril 2022",
    bio: "Documentaires, westerns et cinéma asiatique.",
    filmCount: 174,
    averageRating: 7.3,
    reviewCount: 41,
    followersCount: 95,
    followingCount: 50,
  },
];

// TODO: remplacer par -> GET /api/users/:id/favorites
const favorites: FavoriteFilm[] = [
  {
    id: 1,
    title: "Parasite",
    year: 2019,
    rating: 9.2,
    imageUrl: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
    genres: ["Thriller", "Drame"],
  },
  {
    id: 2,
    title: "Interstellar",
    year: 2014,
    rating: 8.7,
    imageUrl: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    genres: ["Science-fiction", "Aventure"],
  },
  {
    id: 3,
    title: "The Dark Knight",
    year: 2008,
    rating: 9.0,
    imageUrl: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    genres: ["Action", "Crime"],
  },
  {
    id: 4,
    title: "Inception",
    year: 2010,
    rating: 8.8,
    imageUrl: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    genres: ["Science-fiction", "Thriller"],
  },
];

function ProfilPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"followers" | "following">("followers");

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-8">

        <Button
          variant="ghost"
          onClick={() => navigate({ to: "/" })}
          className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 text-sm px-0"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>

        <div className="rounded-2xl border border-zinc-800 overflow-hidden">
          <ProfileCard
            name={userProfile.name}
            initials={userProfile.initials}
            memberSince={userProfile.memberSince}
            bio={userProfile.bio}
            stats={userProfile.stats}
          />
        </div>

        <div className="flex gap-2 mt-8 border-b border-zinc-800 pb-4">
          <Button
            onClick={() => setActiveTab("followers")}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
              activeTab === "followers"
                ? "bg-red-600 text-white hover:bg-red-500"
                : "bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700"
            }`}
          >
            Abonnés ({followers.length})
          </Button>
          <Button
            onClick={() => setActiveTab("following")}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
              activeTab === "following"
                ? "bg-red-600 text-white hover:bg-red-500"
                : "bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700"
            }`}
          >
            Abonnements ({following.length})
          </Button>
        </div>

        {activeTab === "followers" && (
          <div className="mt-6">
            <h2 className="text-base font-semibold text-zinc-300 mb-4">
              Mes Abonnés ({followers.length})
            </h2>
            <div className="flex flex-col gap-3">
              {followers.map((user) => (
                <UserProfileCard key={user.username} user={user} />
              ))}
            </div>
          </div>
        )}

        {activeTab === "following" && (
          <div className="mt-6">
            <h2 className="text-base font-semibold text-zinc-300 mb-4">
              Mes Abonnements ({following.length})
            </h2>
            <div className="flex flex-col gap-3">
              {following.map((user) => (
                <UserProfileCard key={user.username} user={user} />
              ))}
            </div>
          </div>
        )}

        <div className="mt-10 border-t border-zinc-800 pt-8">
          <h2 className="text-base font-semibold text-zinc-300 mb-4">
            Favoris ({favorites.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {favorites.map((film) => (
              <MovieCard
                key={film.id}
                id={film.id}
                title={film.title}
                year={film.year}
                rating={film.rating}
                imageUrl={film.imageUrl}
                genres={film.genres}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
