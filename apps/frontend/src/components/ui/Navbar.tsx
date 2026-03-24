import { useState } from "react";
import { Clapperboard, Search, Users, User } from "lucide-react";
import { focusVisibleRingClass, glassHeaderClass } from "@/lib/glass-ui";
import { cn } from "@/lib/utils";

type CineConnectNavbarProps = {
  onSearch?: (query: string) => void;
  onFriendsClick?: () => void;
  onProfileClick?: () => void;
};

const iconBtnClass = cn(
  "flex h-10 w-10 items-center justify-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] text-ink-secondary transition-colors hover:border-accent-red/40 hover:text-ink",
  focusVisibleRingClass
);

const CineConnectNavbar = ({
  onSearch,
  onFriendsClick,
  onProfileClick,
}: CineConnectNavbarProps) => {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (onSearch && query.trim() !== "") {
      onSearch(query.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <nav
      className={cn(
        "flex h-16 w-full items-center gap-5 border-b border-[var(--glass-border)] px-6",
        glassHeaderClass
      )}
    >
      <a
        href="/"
        className={cn("flex shrink-0 items-center gap-2 no-underline rounded-lg", focusVisibleRingClass)}
      >
        <Clapperboard size={28} className="text-accent-red" aria-hidden />
        <span className="text-xl font-bold">
          <span className="text-ink">Ciné</span>
          <span className="text-accent-red">Connect</span>
        </span>
      </a>

      <div className="flex h-10 w-full max-w-lg flex-1 items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 transition-colors focus-within:border-accent-red/50 hover:border-[var(--glass-border-strong)]">
        <Search size={16} className="text-ink-muted" aria-hidden />
        <input
          type="text"
          placeholder="Rechercher un film..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full rounded-md bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-red"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <button type="button" onClick={onFriendsClick} aria-label="Amis" className={iconBtnClass}>
          <Users size={18} />
        </button>
        <button type="button" onClick={onProfileClick} aria-label="Profil" className={iconBtnClass}>
          <User size={18} />
        </button>
      </div>
    </nav>
  );
};

export default CineConnectNavbar;
