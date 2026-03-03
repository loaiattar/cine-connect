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
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const features = [
    {
      icon: Clapperboard,
      title: "Catalogue Immense",
      text: "Explorez des milliers de films avec des filtres avancés par genre, année et note",
      color: "text-red-500",
    },
    {
      icon: Star,
      title: "Notez & Critiquez",
      text: "Partagez vos avis avec un système de notation par étoiles et des critiques détaillées",
      color: "text-yellow-400",
    },
    {
      icon: Users,
      title: "Communauté Active",
      text: "Suivez d'autres cinéphiles et construisez votre réseau de passionnés de cinéma",
      color: "text-red-500",
    },
    {
      icon: MessageCircle,
      title: "Chat en Temps Réel",
      text: "Discutez en direct avec la communauté et échangez en privé avec vos abonnés",
      color: "text-yellow-400",
    },
  ];

  return (
    <div className="bg-black text-white">
      <header className="flex items-center justify-between px-8 py-5 bg-gradient-to-b from-black/90 to-transparent sticky top-0 z-50 backdrop-blur-sm border-b border-zinc-800/50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 font-extrabold text-2xl tracking-tight">
            <Clapperboard className="text-red-500 w-6 h-6" />
            <span>
              <span className="text-red-500">Ciné</span>
              <span className="text-orange-400">Connect</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/RegisterPage"
            className="rounded border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-zinc-900 transition-colors px-4 py-2 text-sm font-bold"
          >
            S'inscrire
          </Link>
          <Link
            to="/LoginPage"
            className="rounded bg-yellow-400 text-zinc-900 hover:bg-yellow-300 transition-colors px-5 py-2 text-sm font-bold"
          >
            Se connecter
          </Link>
        </div>
      </header>
      <section className="relative px-6 py-20 text-center border-b border-zinc-800 overflow-hidden">
        <img
          src={bgImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
        />
        <div className="relative z-10 mx-auto max-w-3xl">
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight flex items-center justify-center gap-3">
            <Clapperboard className="text-red-500 w-12 h-12" />
            <span>
              <span className="text-red-500">Ciné</span>
              <span className="text-orange-400">Connect</span>
            </span>
          </h1>
          <p className="mt-6 text-xl text-zinc-100">
            La plateforme collaborative pour les passionnés de cinéma
          </p>
          <p className="mt-3 text-zinc-400">
            Découvrez, notez et discutez de vos films préférés avec une
            communauté de cinéphiles du monde entier
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/RegisterPage"
              className="rounded-lg bg-red-600 hover:bg-red-500 transition-colors px-6 py-3 font-semibold inline-flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              Commencer l'aventure
            </Link>
            <Link
              to="/ancienne-page"
              className="rounded-lg border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-zinc-900 transition-colors px-6 py-3 font-semibold inline-flex items-center justify-center"
            >
              Voir l'ancienne page
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 border-b border-zinc-800">
        <h2 className="text-4xl font-bold text-center">
          Pourquoi <span className="text-red-500">CinéConnect</span> ?
        </h2>
        <p className="text-center text-zinc-400 mt-3">
          Une expérience cinématographique complète et sociale
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-10">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.title}
                className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-6"
              >
                <Icon className={`w-7 h-7 ${feature.color}`} />
                <h3 className="mt-4 text-2xl font-semibold">{feature.title}</h3>
                <p className="mt-2 text-zinc-400">{feature.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="px-6 py-16 border-b border-zinc-800">
        <h2 className="text-4xl font-bold">
          Une expérience <span className="text-yellow-400">immersive</span>
        </h2>
        <p className="mt-4 text-zinc-400">
          Plongez dans l'univers du cinéma avec une interface professionnelle
          conçue pour les vrais passionnés.
        </p>

        <ul className="mt-8 space-y-4">
          <li className="flex items-start gap-3">
            <span className="text-red-500">●</span>
            <span>
              Fiches films détaillées avec bandes-annonces et synopsis
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-red-500">●</span>
            <span>Statistiques personnelles et historique de visionnage</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="text-red-500">●</span>
            <span>Recommandations personnalisées basées sur vos goûts</span>
          </li>
        </ul>

        <Link
          to="/RegisterPage"
          className="mt-8 inline-block rounded-lg bg-red-600 hover:bg-red-500 transition-colors px-6 py-3 font-semibold"
        >
          Rejoindre CinéConnect
        </Link>
      </section>

      <section className="px-6 py-20 text-center border-b border-zinc-800">
        <h2 className="text-5xl font-bold">Prêt à rejoindre la communauté ?</h2>
        <p className="mt-4 text-zinc-400">
          Des milliers de cinéphiles vous attendent pour partager leur passion
          du 7ème art
        </p>
        <Link
          to="/RegisterPage"
          className="mt-8 rounded-lg bg-yellow-400 text-zinc-900 hover:bg-yellow-300 transition-colors px-8 py-3 font-semibold inline-flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          Commencer maintenant
        </Link>
      </section>

      <footer className="border-t border-zinc-800 px-6 pt-10 pb-6 text-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 font-bold text-lg mb-2">
              <Clapperboard className="text-red-500 w-5 h-5" />
              <span>
                <span className="text-red-500">Ciné</span>
                <span className="text-orange-400">Connect</span>
              </span>
            </div>
            <p className="text-sm text-zinc-400">
              La plateforme collaborative pour les passionnés de cinéma.
            </p>
            <div className="flex items-center gap-2 mt-4 text-zinc-400 hover:text-white transition-colors cursor-pointer">
              <Mail className="w-4 h-4" />
              <span className="text-sm">contact@cineconnect.fr</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-300 uppercase tracking-widest mb-3">
              Navigation
            </p>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Accueil</Link>
              </li>
              <li className="hover:text-white cursor-pointer transition-colors">
                Catalogue
              </li>
              <li className="hover:text-white cursor-pointer transition-colors">
                Communauté
              </li>
              <li>
                <Link to="/RegisterPage" className="hover:text-white transition-colors">S'inscrire</Link>
              </li>
              <li>
                <Link to="/LoginPage" className="hover:text-white transition-colors">Se connecter</Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-300 uppercase tracking-widest mb-3">
              Légal
            </p>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="hover:text-white cursor-pointer transition-colors">
                Mentions légales
              </li>
              <li className="hover:text-white cursor-pointer transition-colors">
                Politique de confidentialité
              </li>
              <li className="hover:text-white cursor-pointer transition-colors">
                CGU
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-zinc-800 pt-4 text-center text-xs text-zinc-500 flex items-center justify-center gap-1">
          <span>© 2026 CinéConnect. Fait avec</span>
          <Heart className="w-3 h-3 text-red-500 fill-red-500" />
          <span>par des passionnés de cinéma.</span>
        </div>
      </footer>
    </div>
  );
}
