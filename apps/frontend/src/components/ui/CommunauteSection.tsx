import React, { useState } from "react";
import { Users, Search, ChevronDown } from "lucide-react";

type Props = {
  membresCount?: number;
  abonnementsCount?: number;
  abonnesCount?: number;
  onSearch?: (q: string) => void;
  onFilterChange?: (f: string) => void;
};

const filters = ["Plus populaires", "Plus recents", "Alphabetique"];

const CommunauteSection = ({ membresCount = 7, abonnementsCount = 3, abonnesCount = 5, onSearch, onFilterChange }: Props) => {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState(filters[0]);
  const [open, setOpen] = useState(false);

  const handleFilter = (f: string) => {
    setFilter(f);
    setOpen(false);
    onFilterChange?.(f);
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white px-8 py-10">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Users size={28} className="text-[#e50914]" />
          <h1 className="text-3xl font-bold">Communaute</h1>
        </div>
        <p className="text-gray-400 text-sm">Decouvrez d'autres passionnes de cinema et suivez leurs critiques</p>
      </div>

      {/* Recherche + Filtre */}
      <div className="flex gap-3 mb-8">
        <div className="flex items-center gap-2 flex-1 bg-[#1a1a1a] ring-1 ring-[#2a2a2a] rounded-full px-4 h-10 hover:ring-[#e50914]">
          <Search size={15} className="text-gray-500" />
          <input
            placeholder="Rechercher un utilisateur..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); onSearch?.(e.target.value); }}
            className="bg-transparent outline-none text-white text-sm w-full placeholder:text-gray-500"
          />
        </div>

        {/* Dropdown custom */}
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 bg-[#1a1a1a] ring-1 ring-[#2a2a2a] text-white text-sm px-4 h-10 rounded-lg hover:ring-[#e50914] cursor-pointer"
          >
            {filter}
            <ChevronDown size={14} className={open ? "rotate-180" : ""} />
          </button>
          {open && (
            <div className="absolute right-0 mt-1 w-44 bg-[#1a1a1a] ring-1 ring-[#2a2a2a] rounded-lg overflow-hidden z-10">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => handleFilter(f)}
                  className={"w-full text-left px-4 py-2 text-sm hover:bg-[#e50914] " + (f === filter ? "text-[#e50914]" : "text-white")}
                >
                  {f}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cartes de stats */}
      <div className="flex gap-4">
        <div className="flex-1 bg-[#1a1a1a] ring-1 ring-[#2a2a2a] rounded-xl py-8 text-center">
          <p className="text-5xl font-bold text-[#e50914]">{membresCount}</p>
          <p className="text-sm mt-2">Membres</p>
        </div>
        <div className="flex-1 bg-[#1a1a1a] ring-1 ring-[#2a2a2a] rounded-xl py-8 text-center">
          <p className="text-5xl font-bold text-[#f5a623]">{abonnementsCount}</p>
          <p className="text-sm mt-2">Abonnements</p>
        </div>
        <div className="flex-1 bg-[#1a1a1a] ring-1 ring-[#2a2a2a] rounded-xl py-8 text-center">
          <p className="text-5xl font-bold text-[#22c55e]">{abonnesCount}</p>
          <p className="text-sm mt-2">Abonnes</p>
        </div>
      </div>

    </div>
  );
};

export default CommunauteSection;
