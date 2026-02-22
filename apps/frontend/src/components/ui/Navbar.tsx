import React, { useState } from "react";
import { Clapperboard, Search, Users, User } from "lucide-react";

const fontImport = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');`;

interface CineConnectNavbarProps {
  onSearch?: (query: string) => void;
  onFriendsClick?: () => void;
  onProfileClick?: () => void;
}

const iconBtnClass = [
  "w-10 h-10 rounded-full",
  "bg-[#1a1a1a] border border-[#2a2a2a]",
  "flex items-center justify-center",
  "text-[#888888]",
  "transition-all duration-200",
  "hover:border-primary hover:shadow-[0_0_0_3px_rgba(220,38,38,0.2)] hover:text-white",
  "cursor-pointer",
].join(" ");

function CineConnectNavbar(props: CineConnectNavbarProps) {
  const { onSearch, onFriendsClick, onProfileClick } = props;
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
          <Clapperboard size={28} className="text-primary" />
          <span className="text-xl leading-none font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
            <span className="text-white">Ciné</span>
            <span className="text-primary">Connect</span>
          </span>
        </a>

        {/* Search */}
        <div className="flex-1 max-w-[520px] flex items-center gap-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-full px-4 h-10 transition-all duration-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
          <Search size={16} className="text-[#9ca3af] shrink-0" />
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

        {/* Boutons droite */}
        <div className="ml-auto flex items-center gap-3">

          <button className={iconBtnClass} aria-label="Amis" onClick={onFriendsClick}>
            <Users size={18} />
          </button>

          <button className={iconBtnClass} aria-label="Profil" onClick={onProfileClick}>
            <User size={18} />
          </button>

        </div>

      </nav>
    </>
  );
}

export default CineConnectNavbar;
