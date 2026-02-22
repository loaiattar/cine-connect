import { useState } from "react"
import type { ChangeEvent } from "react"

type SelectEvent = ChangeEvent<HTMLSelectElement>

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

  const handleGenreChange = (e: SelectEvent) => {
    setSelectedGenre(e.target.value)
    onFilterChange("genre", e.target.value)
  }

  const handleRatingChange = (e: SelectEvent) => {
    setSelectedRating(e.target.value)
    onFilterChange("minRating", e.target.value)
  }

  const handleYearChange = (e: SelectEvent) => {
    setSelectedYear(e.target.value)
    onFilterChange("year", e.target.value)
  }

  const handleReset = () => {
    setSelectedGenre("")
    setSelectedRating("")
    setSelectedYear("")
    onReset()
  }

  return (
    <div
      className="w-full px-6 py-4"
      style={{ backgroundColor: "#0f172a" }}
    >
      {/* Titre */}
      <div className="flex items-center gap-2 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        <h2 className="text-white font-bold text-base">Filtres</h2>
      </div>

      {/* Selects */}
      <div className="flex gap-3 mb-4">

        {/* Genre */}
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-gray-400 text-xs">Genre</label>
          <div className="relative">
            <select
              value={selectedGenre}
              onChange={handleGenreChange}
              className="appearance-none w-full text-white border border-gray-700 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
              style={{ backgroundColor: "#1e293b" }}
            >
              <option value="">Tous les genres</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">▼</span>
          </div>
        </div>

        {/* Note minimale */}
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-gray-400 text-xs">Note minimale</label>
          <div className="relative">
            <select
              value={selectedRating}
              onChange={handleRatingChange}
              className="appearance-none w-full text-white border border-gray-700 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
              style={{ backgroundColor: "#1e293b" }}
            >
              <option value="">Toutes les notes</option>
              {minRatings.map((rating) => (
                <option key={rating} value={rating}>{rating}</option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">▼</span>
          </div>
        </div>

        {/* Année */}
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-gray-400 text-xs">Année</label>
          <div className="relative">
            <select
              value={selectedYear}
              onChange={handleYearChange}
              className="appearance-none w-full text-white border border-gray-700 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
              style={{ backgroundColor: "#1e293b" }}
            >
              <option value="">Toutes les années</option>
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">▼</span>
          </div>
        </div>

      </div>

      {/* Bouton réinitialiser */}
      <button
        onClick={handleReset}
        className="border border-gray-700 text-white bg-transparent rounded-md px-4 py-1.5 text-xs hover:bg-gray-800 transition-colors"
      >
        Réinitialiser les filtres
      </button>

    </div>
  )
}

export default FilterBar
