import { useState, useRef, useEffect } from "react";

const ChevronIcon = ({ open = false }: { open?: boolean }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${open ? "rotate-180" : ""}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

type Option = {
  label: string;
  value: string;
};

const CustomSelect = ({
  options,
  value,
  placeholder,
  onChange,
}: {
  options: Option[];
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Ferme le dropdown si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-sm border border-gray-600 rounded-lg hover:border-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors cursor-pointer"
        style={{
          backgroundColor: "#1e293b",
          color: selected ? "white" : "#9ca3af",
        }}
      >
        <span className="truncate">
          {selected ? selected.label : placeholder}
        </span>
        <ChevronIcon open={isOpen} />
      </button>

      {isOpen && (
        <ul
          className="absolute z-20 w-full mt-1 border border-gray-600 rounded-lg overflow-hidden shadow-xl"
          style={{ backgroundColor: "#1e293b" }}
        >
          {options.map((option) => (
            <li
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                option.value === value
                  ? "font-bold text-blue-400 bg-blue-500/10"
                  : "text-gray-200 hover:bg-white/5"
              }`}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

interface FilterBarProps {
  genres: string[];
  minRatings: string[];
  years: string[];
  onFilterChange: (filterName: string, value: string) => void;
  onReset: () => void;
}

const FilterBar = ({
  genres,
  minRatings,
  years,
  onFilterChange,
  onReset,
}: FilterBarProps) => {
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedRating, setSelectedRating] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const genreOptions: Option[] = [
    { value: "", label: "Tous les genres" },
    ...genres.map((g) => ({ value: g, label: g })),
  ];

  const ratingOptions: Option[] = [
    { value: "", label: "⭐ Toutes les notes" },
    ...minRatings.map((r) => ({ value: r, label: `⭐ ${r} et plus` })),
  ];

  const yearOptions: Option[] = [
    { value: "", label: "📅 Toutes les années" },
    ...years.map((y) => ({ value: y, label: `📅 ${y}` })),
  ];

  const handleGenreChange = (value: string) => {
    setSelectedGenre(value);
    onFilterChange("genre", value);
  };

  const handleRatingChange = (value: string) => {
    setSelectedRating(value);
    onFilterChange("minRating", value);
  };

  const handleYearChange = (value: string) => {
    setSelectedYear(value);
    onFilterChange("year", value);
  };

  const handleReset = () => {
    setSelectedGenre("");
    setSelectedRating("");
    setSelectedYear("");
    onReset();
  };

  return (
    <div className="w-full px-6 py-4" style={{ backgroundColor: "#0f172a" }}>
      <div className="flex items-center gap-2 mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 text-red-500 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
          />
        </svg>
        <h2 className="text-white font-bold text-base">Filtres</h2>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-gray-400 text-xs font-medium tracking-wide uppercase">
            Genre
          </label>
          <CustomSelect
            options={genreOptions}
            value={selectedGenre}
            placeholder="Tous les genres"
            onChange={handleGenreChange}
          />
        </div>

        <div className="flex flex-col gap-1 flex-1">
          <label className="text-gray-400 text-xs font-medium tracking-wide uppercase">
            Note minimale
          </label>
          <CustomSelect
            options={ratingOptions}
            value={selectedRating}
            placeholder="⭐ Toutes les notes"
            onChange={handleRatingChange}
          />
        </div>

        <div className="flex flex-col gap-1 flex-1">
          <label className="text-gray-400 text-xs font-medium tracking-wide uppercase">
            Année
          </label>
          <CustomSelect
            options={yearOptions}
            value={selectedYear}
            placeholder="📅 Toutes les années"
            onChange={handleYearChange}
          />
        </div>
      </div>

      <button
        onClick={handleReset}
        className="border border-gray-600 text-gray-300 bg-transparent rounded-md px-4 py-1.5 text-xs hover:bg-gray-800 hover:text-white hover:border-gray-400 transition-colors"
      >
        Réinitialiser les filtres
      </button>
    </div>
  );
};

export default FilterBar;
