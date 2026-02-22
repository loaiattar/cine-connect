import React, { useState } from "react";
import { Clapperboard, Search, Users, User } from "lucide-react";

type CineConnectNavbarProps = {
  onSearch?: (query: string) => void;
  onFriendsClick?: () => void;
  onProfileClick?: () => void;
};

cineConnectNavbar function({ onSearch, onFriendsClick, onProfileClick }: CineConnectNavbarProps) {
  const [query, setQuery] = useState("");

  function handleSearch() {
    if (onSearch && query.trim() !== "") {
      onSearch(query.trim());
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleSearch();
    }
  }

  return (
    <nav className="w-full h-16 bg-[#0d0d0d] border-b border-[#2a2a2a] flex items-center px-6 gap-5">

      {/* Logo */}
      <a href="/" className="flex items-center gap-2 shrink-0 no-underline">
        <Clapperboard size={28} className="text-primary" />
        <span className="text-xl font-bold" style={{ fontFamily: "Georgia, serif" }}>
          <span className="text-white">Ciné</span>
          <span className="text-primary">Connect</span>
        </span>
      </a>

      {/* Barre de recherche */}
      <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-full px-4 h-10 w-full max-w-lg focus-within:border-primary">
        <Search size={16} className="text-gray-500" />
        <input
          type="text"
          placeholder="Rechercher un film..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="bg-transparent outline-none text-white text-sm w-full placeholder:text-gray-500"
        />
      </div>

      {/* Boutons à droite */}
      <div className="ml-auto flex items-center gap-3">
        <button
          onClick={onFriendsClick}
          aria-label="Amis"
          className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-gray-400 hover:text-white hover:border-primary"
        >
          <Users size={18} />
        </button>

        <button
          onClick={onProfileClick}
          aria-label="Profil"
          className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-gray-400 hover:text-white hover:border-primary"
        >
          <User size={18} />
        </button>
      </div>

    </nav>
  );
}

export default CineConnectNavbar;
