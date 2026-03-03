import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
export function Error404() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white px-4">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-6xl mb-4">🎬</div>

        <h1 className="text-8xl font-bold text-[#DC2626] mb-4">404</h1>

        <h2 className="text-2xl font-semibold mb-2">Oops, cette page n'existe pas</h2>

        <p className="text-zinc-400 mb-8">
          Le film que tu cherches n'est pas au programme
        </p>

        <Link
          to="/"
          className="bg-[#DC2626] hover:bg-red-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
        >
          Retour à l'accueil
        </Link>
      </motion.div>
    </div>
  );
}
