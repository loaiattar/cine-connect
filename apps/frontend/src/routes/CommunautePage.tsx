import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Clapperboard, Users } from "lucide-react";

export const Route = createFileRoute("/CommunautePage")({
  component: CommunautePage,
});

const membres = [
  {
    id: 1,
    username: "Alice Martin",
    bio: "Passionnée de cinéma français.",
    films: 142,
  },
  { id: 2, username: "Tom Dubois", bio: "Fan de science-fiction.", films: 89 },
  {
    id: 3,
    username: "Sara Benali",
    bio: "J'adore les comédies romantiques.",
    films: 57,
  },
  {
    id: 4,
    username: "Karim Leroy",
    bio: "Spécialiste des films noirs des années 50.",
    films: 315,
  },
];

function CommunautePage() {
  const [recherche, setRecherche] = useState("");

  const resultats = membres.filter((m) =>
    m.username.toLowerCase().includes(recherche.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 border-b border-zinc-800/50 bg-black/90 backdrop-blur-sm px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 font-extrabold text-xl tracking-tight text-white hover:text-zinc-300 transition-colors"
          >
            <Clapperboard className="w-6 h-6 text-red-500" />
            <span>
              <span className="text-red-500">Ciné</span>
              <span className="text-orange-400">Connect</span>
            </span>
          </Link>
          <Link
            to="/"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            ← Accueil
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex items-center gap-3">
          <Users className="h-8 w-8 text-red-500" />
          <h1 className="text-2xl font-bold">Communauté</h1>
        </div>

        <input
          type="text"
          placeholder="Rechercher a member..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          className="mb-6 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
        />

        {resultats.length === 0 && (
          <p className="text-center text-zinc-400">
            Aucun membre trouvé pour "{recherche}"
          </p>
        )}

        <ul className="space-y-3">
          {resultats.map((membre) => (
            <li
              key={membre.id}
              className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3"
            >
              <p className="font-semibold text-white">{membre.username}</p>
              <p className="text-sm text-zinc-400">{membre.bio}</p>
              <p className="mt-1 text-xs text-zinc-500">
                {membre.films} films vus
              </p>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

export default CommunautePage;
