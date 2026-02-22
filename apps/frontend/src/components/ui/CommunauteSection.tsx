import React, { useState } from "react";
import { Users, Search } from "lucide-react";

const fontImport = `@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap');`;

type CommunauteSectionProps = {
  membresCount?: number;
  abonnementsCount?: number;
  abonnesCount?: number;
  onSearch?: (query: string) => void;
  onFilterChange?: (filter: string) => void;
};

const CommunauteSection = (props: CommunauteSectionProps) => {
  const {
    membresCount = 7,
    abonnementsCount = 3,
    abonnesCount = 5,
    onSearch,
    onFilterChange,
  } = props;

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Plus populaires");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  const handleFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value);
    if (onFilterChange) {
      onFilterChange(e.target.value);
    }
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: "#1a1a1a",
    border: "1px solid #2a2a2a",
    borderRadius: "12px",
    padding: "32px 24px",
    textAlign: "center",
    flex: 1,
  };

  return (
    <>
      <style>{fontImport}</style>
      <div className="min-h-screen bg-[#0d0d0d] text-white px-8 py-10" style={{ fontFamily: "'DM Sans', sans-serif" }}>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users size={32} color="#e50914" />
            <h1 className="text-3xl font-bold text-white">Communauté</h1>
          </div>
          <p className="text-gray-400 text-base">
            Découvrez d'autres passionnés de cinéma et suivez leurs critiques
          </p>
        </div>

        {/* Recherche + Filtre */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center gap-2 flex-1 bg-[#1a1a1a] rounded-full px-4 h-11 hover:border-[#e50914]" style={{ border: "1px solid #2a2a2a" }}>
            <Search size={16} className="text-gray-500 shrink-0" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={query}
              onChange={handleSearch}
              className="bg-transparent outline-none text-white text-sm w-full placeholder:text-gray-500"
            />
          </div>
          <select
            value={filter}
            onChange={handleFilter}
            className="bg-[#1a1a1a] text-white text-sm px-4 h-11 rounded-lg cursor-pointer outline-none hover:border-[#e50914]"
            style={{ border: "1px solid #2a2a2a" }}
          >
            <option value="Plus populaires">Plus populaires</option>
            <option value="Plus recents">Plus récents</option>
            <option value="Alphabetique">Alphabétique</option>
          </select>
        </div>

        {/* Cartes de stats */}
        <div className="flex gap-4">

          <div style={cardStyle}>
            <p style={{ fontSize: "3rem", fontWeight: 700, color: "#e50914", lineHeight: 1 }}>
              {membresCount}
            </p>
            <p className="text-white text-sm font-medium mt-2">Membres</p>
          </div>

          <div style={cardStyle}>
            <p style={{ fontSize: "3rem", fontWeight: 700, color: "#f5a623", lineHeight: 1 }}>
              {abonnementsCount}
            </p>
            <p className="text-white text-sm font-medium mt-2">Abonnements</p>
          </div>

          <div style={cardStyle}>
            <p style={{ fontSize: "3rem", fontWeight: 700, color: "#22c55e", lineHeight: 1 }}>
              {abonnesCount}
            </p>
            <p className="text-white text-sm font-medium mt-2">Abonnés</p>
          </div>

        </div>

      </div>
    </>
  );
};

export default CommunauteSection;
