import { Link } from "@tanstack/react-router";

export function Error404() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white px-4">
      <div className="text-center max-w-lg">
        <p className="text-[#DC2626] text-xl font-semibold tracking-widest uppercase mb-4">
          Erreur
        </p>

        <h1 className="text-[180px] font-black leading-none text-white">
          404
        </h1>

        <div className="w-24 h-1 bg-[#DC2626] mx-auto my-6" />

        <h2 className="text-2xl font-bold mb-3">Page introuvable</h2>

        <p className="text-zinc-400 text-base mb-10">
          La page que tu cherches n'existe pas ou a été déplacée.
        </p>

        <Link
          to="/"
          className="inline-block bg-[#DC2626] hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-200"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
