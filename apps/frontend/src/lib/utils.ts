import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getMovieImageUrl = (posterPath: string, size: string = "w500") => {
  if (!posterPath) return "/placeholder.jpg"
  const baseUrl = import.meta.env.VITE_TMDB_IMAGE_BASE_URL;
  return `${baseUrl}${size}${posterPath}`
}