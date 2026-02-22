import React, { useState } from "react";

// Google Fonts import 
const fontImport = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');`;



function FilmIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="#DC2626" fillOpacity="0.12" />
      <rect x="7"    y="7"    width="7.5" height="7.5" rx="1.5" fill="#DC2626" />
      <rect x="17.5" y="7"    width="7.5" height="7.5" rx="1.5" fill="#DC2626" />
      <rect x="7"    y="17.5" width="7.5" height="7.5" rx="1.5" fill="#DC2626" />
      <rect x="17.5" y="17.5" width="7.5" height="7.5" rx="1.5" fill="#DC2626" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="5" stroke="#9ca3af" strokeWidth="1.5" />
      <line x1="10.5" y1="10.5" x2="14" y2="14" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}



interface CineConnectNavbarProps {
  onSearch?:       (query: string) => void;
  onFriendsClick?: () => void;
  onProfileClick?: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

function CineConnectNavbar(props: CineConnectNavbarProps) {
  const { onSearch } = props;
  const [query, setQuery] = useState("");

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && onSearch) {
      onSearch(query.trim());
    }
  }

  return (
    <>
      <style>{fontImport}</style>

      <nav className="w-full h-16 bg-[#0d0d0d] border-b border-[#2a2a2a] flex items-center px-6 gap-5" aria-label="Navigation principale">

        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 no-underline shrink-0" aria-label="Accueil CinéConnect">
          <FilmIcon />
          <span className="text-xl leading-none font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
            <span className="text-white">Ciné</span>
            <span className="text-primary">Connect</span>
          </span>
        </a>

        {/* Search */}
        <div className="flex-1 max-w-[520px] flex items-center gap-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-full px-4 h-10 transition-all duration-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
          <SearchIcon />
          <input
            className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder:text-muted-foreground"
            type="text"
            placeholder="Rechercher un film..."
            aria-label="Rechercher un film"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

      </nav>
    </>
  );
}

export default CineConnectNavbar;
