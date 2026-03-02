import { createFileRoute } from "@tanstack/react-router";
import ProfileCard from "@/components/ui/InfoProfileCard";
import { UserProfileCard } from "@/components/ui/ProfileCard1";
import MovieCard from "@/components/ui/CardFilm";

export const Route = createFileRoute("/profil")({
  component: ProfilPage,
});

// Types

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

// ── Mock data ─────────────────────────────────────────────────────────────────

const userProfile = {
  name: "Marie Dupont",
  initials: "MD",
  memberSince: "janvier 2023",
  bio: "Passionnée de cinéma indépendant et de films noirs. Toujours à la recherche de la prochaine pépite.",
  stats: {
    filmsRated: 142,
    avgRating: 7.4,
    comments: 38,
    followers: 94,
    following: 57,
  },
};

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

// ── Page ──────────────────────────────────────────────────────────────────────

function ProfilPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold">Profil utilisateur</h1>
      {/* composants vérifiés — non rendus */}
      {false && <ProfileCard {...userProfile} />}
      {false && <UserProfileCard user={followers[0]} />}
      {false && <MovieCard {...favorites[0]} />}
    </div>
  );
}
