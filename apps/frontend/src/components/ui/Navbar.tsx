import React from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500&display=swap');

  :root {
    --cc-bg:         #0d0d0d;
    --cc-border:     #2a2a2a;
    --cc-surface:    #1a1a1a;
    --cc-accent:     #e50914;
    --cc-white:      #ffffff;
    --cc-muted:      #888888;
    --cc-height:     64px;
    --cc-transition: 0.2s ease;
  }

  .cc-navbar {
    width: 100%;
    height: var(--cc-height);
    background-color: var(--cc-bg);
    border-bottom: 1px solid var(--cc-border);
    display: flex;
    align-items: center;
    padding: 0 24px;
    gap: 20px;
    box-sizing: border-box;
    font-family: 'DM Sans', sans-serif;
  }

  /* ── Logo ── */
  .cc-navbar__logo {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    flex-shrink: 0;
  }

  .cc-navbar__logo-text {
    font-family: 'Playfair Display', serif;
    font-weight: 700;
    font-size: 20px;
    line-height: 1;
  }

  .cc-navbar__logo-cine    { color: var(--cc-white); }
  .cc-navbar__logo-connect { color: var(--cc-accent); }
`;

// ─── FilmIcon SVG ─────────────────────────────────────────────────────────────

const FilmIcon: React.FC = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect width="32" height="32" rx="7" fill="#e50914" fillOpacity="0.12" />
    <rect x="7"    y="7"    width="7.5" height="7.5" rx="1.5" fill="#e50914" />
    <rect x="17.5" y="7"    width="7.5" height="7.5" rx="1.5" fill="#e50914" />
    <rect x="7"    y="17.5" width="7.5" height="7.5" rx="1.5" fill="#e50914" />
    <rect x="17.5" y="17.5" width="7.5" height="7.5" rx="1.5" fill="#e50914" />
  </svg>
);


interface CineConnectNavbarProps {
  onSearch?:       (query: string) => void;
  onFriendsClick?: () => void;
  onProfileClick?: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

const CineConnectNavbar: React.FC<CineConnectNavbarProps> = (_props) => {
  return (
    <>
      <style>{styles}</style>

      <nav className="cc-navbar" aria-label="Navigation principale">

        {/* Logo */}
        <a href="/" className="cc-navbar__logo" aria-label="Accueil CinéConnect">
          <FilmIcon />
          <span className="cc-navbar__logo-text">
            <span className="cc-navbar__logo-cine">Ciné</span>
            <span className="cc-navbar__logo-connect">Connect</span>
          </span>
        </a>

      </nav>
    </>
  );
};

export default CineConnectNavbar;
