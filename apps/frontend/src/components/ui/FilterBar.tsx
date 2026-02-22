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
      <p>FilterBar — en construction</p>
    </div>
  )
}

export default FilterBar
