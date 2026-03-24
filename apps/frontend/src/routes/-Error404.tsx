import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PrimaryButton } from "@/components/glass";

export function Error404() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-app-base px-4 text-ink">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-4 text-6xl" aria-hidden>
          🎬
        </div>

        <h1 className="mb-4 text-8xl font-bold text-accent-red">404</h1>

        <h2 className="mb-2 text-2xl font-semibold">Oops, cette page n&apos;existe pas</h2>

        <p className="mb-8 text-ink-secondary">Le film que tu cherches n&apos;est pas au programme</p>

        <PrimaryButton asChild>
          <Link to="/">Retour à l&apos;accueil</Link>
        </PrimaryButton>
      </motion.div>
    </div>
  );
}
