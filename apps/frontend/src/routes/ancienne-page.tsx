import { createFileRoute } from "@tanstack/react-router";
import { Marquee } from "@/components/ui/marquee";
import { Button } from "@/components/ui/button";
import { UserProfileCard } from "@/components/ui/ProfileCard1";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import ReviewCard from "@/components/ui/CommentSectionComponent";
import RateMovie from "@/components/ui/RateMovie";
import MovieCard from "@/components/ui/CardFilm";
import CommunauteSection from "@/components/ui/CommunauteSection";
import ConversationItem from "@/components/ui/ConversationItem";
import MovieHero from "@/components/ui/MovieHero";
import ProfileCard from "@/components/ui/InfoProfileCard";
import { UserProfileCardCompact } from "@/components/ui/ProfileCardCompact";

export const Route = createFileRoute("/ancienne-page")({
  component: LegacyPage,
});

function LegacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased flex flex-col items-center justify-center overflow-hidden px-4">
      <div className="text-center mb-10">
        <h1 className="text-6xl font-black tracking-tighter mb-4 italic">
          Ciné<span className="text-primary">Connect</span>
        </h1>
        <p className="text-muted-foreground text-lg italic">
          Experience cinema like never before.
        </p>
      </div>

      <div className="w-full max-w-5xl">
        <Marquee pauseOnHover className="[--duration:30s] gap-6">
          {[
            "Inception",
            "Interstellar",
            "The Dark Knight",
            "The Prestige",
            "Dunkirk",
            "Oppenheimer",
          ].map((title) => (
            <div
              key={title}
              className="bg-card px-8 py-4 rounded-2xl border border-border text-card-foreground text-xl font-bold shadow-2xl"
            >
              {title}
            </div>
          ))}
        </Marquee>
      </div>

      <div className="flex gap-4 mt-12">
        <Button size="lg" className="rounded-full px-8 font-bold">
          Watch Now
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="rounded-full px-8 font-bold border-primary text-primary hover:bg-primary/10"
        >
          Explore
        </Button>
        <Button
          asChild
          variant="outline"
          size="lg"
          className="rounded-full px-8 font-bold border-[#e53e3e] text-[#e53e3e] hover:bg-[#e53e3e]/10"
        >
          <a href="/RegisterPage">S'inscrire</a>
        </Button>
        <Button
          asChild
          variant="outline"
          size="lg"
          className="rounded-full px-8 font-bold border-[#f6ad55] text-[#f6ad55] hover:bg-[#f6ad55]/10"
        >
          <a href="/login1">Se connecter</a>
        </Button>
      </div>

      <div className="mt-12 w-full max-w-xl px-4">
        <ProfileCard
          name="Jean Dupont"
          initials="JD"
          memberSince="janvier 2024"
          bio="Passionné de cinéma, fan de Kubrick et Nolan."
          stats={{
            filmsRated: 142,
            avgRating: 7.4,
            comments: 38,
            followers: 210,
            following: 95,
          }}
          isLoading={false}
        />
      </div>

      <div className="mt-12 w-full max-w-xl px-4">
        <UserProfileCardCompact
          username="JaneDoe"
          avatarUrl=""
          filmCount={87}
          followersCount={134}
          isFollowing={false}
          onFollowToggle={() => console.log("Follow toggled")}
          onMessage={() => console.log("Message")}
        />
      </div>

      <div className="mt-12 w-full max-w-5xl px-4">
        <UserProfileCard
          user={{
            username: "JohnDoe",
            memberSince: "janvier 2024",
            bio: "Passionné de cinéma, fan de Kubrick et Nolan.",
            filmCount: 142,
            averageRating: 4.2,
            reviewCount: 38,
            followersCount: 210,
            followingCount: 95,
          }}
          onMessage={() => console.log("Message")}
        />
      </div>

      <div className="mt-12 w-full max-w-6xl">
        <Carousel className="w-full">
          <CarouselContent>
            {[
              "Inception",
              "Interstellar",
              "The Dark Knight",
              "The Prestige",
              "Dunkirk",
              "Oppenheimer",
            ].map((title) => (
              <CarouselItem key={title} className="md:basis-1/2 lg:basis-1/3">
                <div className="bg-card p-44 rounded-2xl border border-border">
                  {title}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>

      {/* Section des avis */}
      <div className="mt-12 w-full max-w-xl flex flex-col gap-4">
        <ReviewCard
          username="Alice"
          date="Il y a 2 jours"
          reviewText="Un film absolument incroyable, je recommande vivement !"
          rating={5}
        />
        <ReviewCard
          username="Thomas"
          date="Il y a 5 jours"
          reviewText="Très bon film, mais la fin m'a laissé sur ma faim."
          rating={3}
        />
        <ReviewCard
          username="Camille"
          date="Il y a 1 semaine"
          reviewText="Visuellement magnifique, une expérience unique en salle."
          rating={4}
        />
      </div>

      {/* composant pour noter un film */}
      <div className="mt-12 w-full max-w-3xl">
        <RateMovie onRate={(note) => console.log("Note :", note)} />
      </div>

      {/* section cartes de films */}
      <div className="mt-12 w-full max-w-6xl grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <MovieCard
          id={1}
          title="Inception"
          year={2010}
          rating={4.8}
          imageUrl="https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg"
          genres={["Action", "Sci-Fi"]}
        />
        <MovieCard
          id={2}
          title="Interstellar"
          year={2014}
          rating={4.7}
          imageUrl="https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg"
          genres={["Aventure", "Drame"]}
        />
        <MovieCard
          id={3}
          title="The Dark Knight"
          year={2008}
          rating={4.9}
          imageUrl="https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg"
          genres={["Action", "Crime"]}
        />
        <MovieCard
          id={4}
          title="Oppenheimer"
          year={2023}
          rating={4.6}
          imageUrl="https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg"
          genres={["Biopic", "Drame"]}
        />
      </div>
      <div className="mt-12 w-full">
        <CommunauteSection />
      </div>

      {/* Conversations */}
      <div className="mt-12 w-full max-w-xl flex flex-col gap-3">
        <ConversationItem name="Alice" preview="Tu as vu Dune 2 ?" date="10:32" />
        <ConversationItem name="Thomas" preview="Incroyable ce film !" date="Hier" avatarColor="#e50914" />
        <ConversationItem name="Camille" preview="On se fait une séance ce soir ?" date="Lun" avatarColor="#22c55e" />
      </div>
      {/* MovieHero */}
      <div className="mt-12 w-full">
        <MovieHero
          title="Inception"
          year={2010}
          director="Christopher Nolan"
          genres={["Action", "Sci-Fi", "Thriller"]}
          rating={4.8}
          posterUrl="https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg"
          onBack={() => console.log("Retour")}
        />
      </div>
    </div>
  );
}
