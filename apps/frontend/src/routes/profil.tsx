import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<"abonnes" | "abonnements">("abonnes");

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-3xl mx-auto">

      <button
        onClick={() => navigate({ to: "/" })}
        className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour
      </button>

      <ProfileCard
        name={userProfile.name}
        initials={userProfile.initials}
        memberSince={userProfile.memberSince}
        bio={userProfile.bio}
        stats={userProfile.stats}
      />

      {/* Onglets */}
      <div className="flex gap-2 mt-8 mb-6">
        <button
          onClick={() => setActiveTab("abonnes")}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
            activeTab === "abonnes"
              ? "bg-red-600 text-white"
              : "bg-zinc-800 text-zinc-400 hover:text-white"
          }`}
        >
          Abonnés ({followers.length})
        </button>
        <button
          onClick={() => setActiveTab("abonnements")}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
            activeTab === "abonnements"
              ? "bg-red-600 text-white"
              : "bg-zinc-800 text-zinc-400 hover:text-white"
          }`}
        >
          Abonnements ({following.length})
        </button>
      </div>

      {false && <UserProfileCard user={followers[0]} />}
      {false && <MovieCard {...favorites[0]} />}

    </div>
  );
}
