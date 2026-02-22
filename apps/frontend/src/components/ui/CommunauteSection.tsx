import React, { useState } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap');

  .communaute {
    min-height: 100vh;
    background-color: #0d0d0d;
    font-family: 'DM Sans', sans-serif;
    color: #ffffff;
    padding: 40px 32px;
    box-sizing: border-box;
  }
`;

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
      <style>{styles}</style>
      <div className="communaute">
        {/* contenu a venir */}
      </div>
    </>
  );
};

export default CommunauteSection;
