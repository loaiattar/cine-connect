import React, { useState } from "react";
import { Users } from "lucide-react";

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

      </div>
    </>
  );
};

export default CommunauteSection;
