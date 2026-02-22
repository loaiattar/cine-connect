import { useState } from "react"

interface FilterBarProps {
  genres: string[]
  minRatings: string[]
  years: string[]
  onFilterChange: (filterName: string, value: string) => void
  onReset: () => void
}

const FilterBar = ({ genres, minRatings, years, onFilterChange, onReset }: FilterBarProps) => {
  const [selectedGenre, setSelectedGenre] = useState("")
  const [selectedRating, setSelectedRating] = useState("")
  const [selectedYear, setSelectedYear] = useState("")

  return (
    <div
      className="w-full p-4 border-b-2 border-blue-500"
      style={{ backgroundColor: "#0f172a" }}
    >
      TITLE/TITRE
      <div className="flex items-center gap-2 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        <h2 className="text-white font-bold text-lg">Filtres</h2>
      </div>

      {/* Selects */}
      <div className="flex gap-4">

        {/* Genre */}
        <div className="flex flex-col gap-1">
          <label className="text-gray-300 text-sm">Genre</label>
          <div className="relative">
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="appearance-none bg-gray-900 text-white border border-gray-600 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none"
            >
              <option value="">Tous les genres</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
            <span className="absolute right-2 top-2.5 text-gray-400 pointer-events-none">▼</span>
          </div>
        </div>

        {/* Note minimale */}
        <div className="flex flex-col gap-1">
          <label className="text-gray-300 text-sm">Note minimale</label>
          <div className="relative">
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="appearance-none bg-gray-900 text-white border border-gray-600 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none"
            >
              <option value="">Toutes les notes</option>
              {minRatings.map((rating) => (
                <option key={rating} value={rating}>{rating}</option>
              ))}
            </select>
            <span className="absolute right-2 top-2.5 text-gray-400 pointer-events-none">▼</span>
          </div>
        </div>

      </div>
    </div>
  )
}

export default FilterBar
