import { Link, createFileRoute } from "@tanstack/react-router";
import bgImage from "../../image/BackGround.png";
import {
  Clapperboard,
  MessageCircle,
  Play,
  Star,
  Users,
  Mail,
  Heart,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMovieList } from "@/hooks/useMovies";
import { GlassPanel, PosterCard, PrimaryButton } from "@/components/glass";
import { glassHeaderClass, navLinkOutlineClass } from "@/lib/glass-ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { isAuthenticated } = useAuth();
  const { data: trendingMovies, isLoading: trendingLoading } = useMovieList();

  const features = [
    {
      icon: Clapperboard,
      title: "Catalogue Immense",
      text: "Explorez des milliers de films avec des filtres avancés par genre, année et note",
      color: "text-accent-red",
    },
    {
      icon: Star,
      title: "Notez & Critiquez",
      text: "Partagez vos avis avec un système de notation par étoiles et des critiques détaillées",
      color: "text-ink-secondary",
    },
    {
      icon: Users,
      title: "Communauté Active",
      text: "Suivez d'autres cinéphiles et construisez votre réseau de passionnés de cinéma",
      color: "text-accent-red",
    },
    {
      icon: MessageCircle,
      title: "Chat en Temps Réel",
      text: "Discutez en direct avec la communauté et échangez en privé avec vos abonnés",
      color: "text-ink-secondary",
    },
  ];

  return (
    <div className="min-h-full bg-app-base text-ink">
      {/* Logged-in users use AppShell + SidebarNav; keep marketing header for guests only */}
      {!isAuthenticated && (
        <header
          className={cn(
            "flex items-center justify-between px-6 py-5 sm:px-8",
            glassHeaderClass
          )}
        >
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 text-2xl font-extrabold tracking-tight">
              <Clapperboard className="h-6 w-6 text-accent-red" aria-hidden />
              <span>
                <span className="text-accent-red">Ciné</span>
                <span className="text-ink">Connect</span>
              </span>
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            <Link to="/register" className={navLinkOutlineClass}>
              S&apos;inscrire
            </Link>
            <PrimaryButton asChild>
              <Link to="/login">Se connecter</Link>
            </PrimaryButton>
          </div>
        </header>
      )}
      <section className="relative overflow-hidden border-b border-[var(--glass-border)] px-6 py-20 text-center">
        <img
          src={bgImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
        />
        <div className="relative z-10 mx-auto max-w-3xl">
          <h1 className="flex items-center justify-center gap-3 text-5xl font-bold tracking-tight sm:text-6xl">
            <Clapperboard className="h-12 w-12 text-accent-red" aria-hidden />
            <span>
              <span className="text-accent-red">Ciné</span>
              <span className="text-ink">Connect</span>
            </span>
          </h1>
          <p className="mt-6 text-xl text-ink">
            La plateforme collaborative pour les passionnés de cinéma
          </p>
          <p className="mt-3 text-ink-secondary">
            Découvrez, notez et discutez de vos films préférés avec une
            communauté de cinéphiles du monde entier
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <PrimaryButton asChild icon={<Play className="h-4 w-4" aria-hidden />}>
              <Link to="/register">Commencer l&apos;aventure</Link>
            </PrimaryButton>
            <Link
              to="/login"
              className={cn(
                navLinkOutlineClass,
                "justify-center px-6 py-3 text-base font-semibold"
              )}
            >
              Se connecter
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--glass-border)] px-6 py-16">
        <h2 className="mb-2 text-center text-4xl font-bold text-ink">
          Découvrir les films du moment
        </h2>
        <p className="mb-8 text-center text-ink-secondary">
          Cliquez sur un film pour voir sa fiche
        </p>
        {trendingLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-accent-red" aria-hidden />
          </div>
        ) : (
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {trendingMovies.slice(0, 10).map((m) => {
              const year = m.release_date ? new Date(m.release_date).getFullYear() : 0;
              return (
                <Link
                  key={m.id}
                  to="/movie/$movieId"
                  params={{ movieId: String(m.id) }}
                  className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-red focus-visible:ring-offset-2 focus-visible:ring-offset-app-base"
                >
                  <PosterCard
                    title={m.title ?? "Sans titre"}
                    posterPath={m.poster_path ?? ""}
                    year={Number.isNaN(year) ? undefined : year}
                    rating={
                      typeof m.vote_average === "number"
                        ? Math.round(m.vote_average * 10) / 10
                        : undefined
                    }
                  />
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="border-b border-[var(--glass-border)] px-6 py-16">
        <h2 className="text-center text-4xl font-bold text-ink">
          Pourquoi <span className="text-accent-red">CinéConnect</span> ?
        </h2>
        <p className="mt-3 text-center text-ink-secondary">
          Une expérience cinématographique complète et sociale
        </p>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <GlassPanel key={feature.title}>
                <article>
                  <Icon className={cn("h-7 w-7", feature.color)} aria-hidden />
                  <h3 className="mt-4 text-2xl font-semibold text-ink">{feature.title}</h3>
                  <p className="mt-2 text-ink-secondary">{feature.text}</p>
                </article>
              </GlassPanel>
            );
          })}
        </div>
      </section>

      <section className="border-b border-[var(--glass-border)] px-6 py-16">
        <h2 className="text-4xl font-bold text-ink">
          Une expérience <span className="text-accent-red">immersive</span>
        </h2>
        <p className="mt-4 text-ink-secondary">
          Plongez dans l&apos;univers du cinéma avec une interface professionnelle
          conçue pour les vrais passionnés.
        </p>

        <ul className="mt-8 space-y-4 text-ink">
          <li className="flex items-start gap-3">
            <span className="text-accent-red">●</span>
            <span>
              Fiches films détaillées avec bandes-annonces et synopsis
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-accent-red">●</span>
            <span>Statistiques personnelles et historique de visionnage</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-accent-red">●</span>
            <span>Recommandations personnalisées basées sur vos goûts</span>
          </li>
        </ul>

        <PrimaryButton asChild className="mt-8">
          <Link to="/register">Rejoindre CinéConnect</Link>
        </PrimaryButton>
      </section>

      <section className="border-b border-[var(--glass-border)] px-6 py-20 text-center">
        <h2 className="text-5xl font-bold text-ink">Prêt à rejoindre la communauté ?</h2>
        <p className="mt-4 text-ink-secondary">
          Des milliers de cinéphiles vous attendent pour partager leur passion
          du 7ème art
        </p>
        <PrimaryButton asChild icon={<Play className="h-4 w-4" aria-hidden />} className="mt-8">
          <Link to="/register">Commencer maintenant</Link>
        </PrimaryButton>
      </section>

      <footer className="border-t border-[var(--glass-border)] px-6 pb-6 pt-10 text-ink">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="mb-2 flex items-center gap-2 text-lg font-bold">
              <Clapperboard className="h-5 w-5 text-accent-red" aria-hidden />
              <span>
                <span className="text-accent-red">Ciné</span>
                <span className="text-ink">Connect</span>
              </span>
            </div>
            <p className="text-sm text-ink-secondary">
              La plateforme collaborative pour les passionnés de cinéma.
            </p>
            <div className="mt-4 flex cursor-pointer items-center gap-2 text-ink-secondary transition-colors hover:text-ink">
              <Mail className="w-4 h-4" />
              <span className="text-sm">contact@cineconnect.fr</span>
            </div>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-ink-secondary">
              Navigation
            </p>
            <ul className="space-y-2 text-sm text-ink-secondary">
              <li>
                <Link to="/" className="transition-colors hover:text-ink">Accueil</Link>
              </li>
              <li className="cursor-pointer transition-colors hover:text-ink">
                Catalogue
              </li>
              <li className="cursor-pointer transition-colors hover:text-ink">
                Communauté
              </li>
              <li>
                <Link to={"/favorites" as "/" | "/favorites"} className="transition-colors hover:text-ink">Mes favoris</Link>
              </li>
              <li>
                <Link to="/register" className="transition-colors hover:text-ink">S&apos;inscrire</Link>
              </li>
              <li>
                <Link to="/login" className="transition-colors hover:text-ink">Se connecter</Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-ink-secondary">
              Légal
            </p>
            <ul className="space-y-2 text-sm text-ink-secondary">
              <li className="cursor-pointer transition-colors hover:text-ink">
                Mentions légales
              </li>
              <li className="cursor-pointer transition-colors hover:text-ink">
                Politique de confidentialité
              </li>
              <li className="cursor-pointer transition-colors hover:text-ink">
                CGU
              </li>
            </ul>
          </div>
        </div>
        <div className="flex items-center justify-center gap-1 border-t border-[var(--glass-border)] pt-4 text-center text-xs text-ink-muted">
          <span>© 2026 CinéConnect. Fait avec</span>
          <Heart className="h-3 w-3 fill-accent-red text-accent-red" aria-hidden />
          <span>par des passionnés de cinéma.</span>
        </div>
      </footer>
    </div>
  );
}
