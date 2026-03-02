import { createFileRoute } from "@tanstack/react-router";
import ProfileCard from "@/components/ui/InfoProfileCard";
import { UserProfileCard } from "@/components/ui/ProfileCard1";
import MovieCard from "@/components/ui/CardFilm";

export const Route = createFileRoute("/profil")({
  component: ProfilPage,
});

function ProfilPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold">Profil utilisateur</h1>
      {/* composants importés — rendus nuls pour l'instant */}
      {false && <ProfileCard />}
      {false && <UserProfileCard user={{} as any} />}
      {false && <MovieCard id={0} title="" year={0} rating={0} imageUrl="" genres={[]} />}
    </div>
  );
}
