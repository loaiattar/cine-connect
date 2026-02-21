import { createFileRoute } from "@tanstack/react-router";
import { Marquee } from "@/components/ui/marquee";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import ReviewCard from "@/components/ui/CommentSectionComponent";

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
    </div>
  );
}
