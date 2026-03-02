import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export const getMovieImageUrl = (posterPath: string, size: string = "w500") => {
  if (!posterPath) return "/placeholder.jpg";
  if (posterPath.startsWith("http")) return posterPath;
  const baseUrl = import.meta.env.VITE_TMDB_IMAGE_BASE_URL ?? TMDB_IMAGE_BASE;
  return `${baseUrl}/${size}${posterPath}`;
};