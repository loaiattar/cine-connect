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
    </div>
  )
}

export default FilterBar
