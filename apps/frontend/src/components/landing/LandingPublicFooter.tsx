import { Link } from "@tanstack/react-router";

import { focusVisibleRingClass } from "@/lib/glass-ui";
import { cn } from "@/lib/utils";

const footerLinkClass = cn(
  "text-sm text-ink-secondary underline-offset-4 transition-colors hover:text-ink hover:underline",
  focusVisibleRingClass,
  "rounded-sm",
);

/**
 * Minimal secondary navigation for the pre-login landing (#332).
 */
export function LandingPublicFooter() {
  return (
    <footer className="relative z-10 border-t border-[var(--glass-border)] bg-black/55 px-6 py-10 backdrop-blur-md">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <nav aria-label="Liens de pied de page" className="flex flex-wrap gap-x-6 gap-y-2">
          <a href="mailto:contact@cineconnect.example" className={footerLinkClass}>
            Contact
          </a>
          <Link to="/search" search={{ q: "", page: 1 }} className={footerLinkClass}>
            Explorer les films
          </Link>
          <span className="text-sm text-ink-muted">Mentions légales (bientôt)</span>
          <span className="text-sm text-ink-muted">À propos (bientôt)</span>
        </nav>
        <p className="max-w-md text-xs leading-relaxed text-ink-muted">
          Ce produit utilise l&apos;API TMDB mais n&apos;est pas approuvé ni certifié par{" "}
          <a
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noreferrer noopener"
            className={footerLinkClass}
          >
            TMDB
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
