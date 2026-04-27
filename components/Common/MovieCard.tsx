"use client";

import { QueryService } from "@/app/services/queryClient";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ProviderBadge from "./ProviderBadge";

export interface MovieCardProps {
  movie: {
    id: number;
    title: string;
    overview: string;
    release_date: string;
    poster_path: string | null;
    vote_average: number;
    providers?: {
      display_priority: number;
      logo_path: string | null;
      provider_id: number;
      provider_name: string;
    }[];
  };
}

const MovieCard = ({ movie }: MovieCardProps) => {
  const router = useRouter();
  const { getPoster } = QueryService;
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : null;
  const rating = Number.isFinite(movie.vote_average) ? movie.vote_average : 0;

  const getRatingColor = (value: number) => {
    if (value >= 8) return "text-green-500 dark:text-green-400";
    if (value >= 7) return "text-yellow-500 dark:text-yellow-400";
    if (value >= 6) return "text-orange-500 dark:text-orange-400";
    return "text-red-500 dark:text-red-400";
  };

  const handleCardPress = () => {
    router.push(`/details/${movie.id}`);
  };

  return (
    <div className="group relative mx-auto w-full max-w-sm">
      <div
        className="relative cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 shadow-md transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl dark:border-gray-700 dark:from-gray-800 dark:to-gray-900 dark:shadow-gray-900/50 dark:hover:shadow-2xl"
        onClick={handleCardPress}
      >
        <div className="relative overflow-hidden rounded-t-lg">
          <Image
            src={getPoster(movie.poster_path)}
            alt={movie.title}
            width={500}
            height={750}
            className="aspect-[2/3] w-full object-cover transition-transform duration-500 group-hover:scale-110"
            priority={false}
            loading="lazy"
            unoptimized
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/80 px-2 py-0.5 text-xs font-medium text-white shadow-lg backdrop-blur-sm dark:bg-black/90 sm:right-3 sm:top-3 sm:px-2.5 sm:py-1">
            <span className="text-yellow-400">★</span>
            <span className={getRatingColor(rating)}>{rating ? rating.toFixed(1) : "NR"}</span>
          </div>

          {releaseYear && (
            <div className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-gray-800 shadow-lg backdrop-blur-sm dark:bg-gray-800/90 dark:text-gray-200 sm:left-3 sm:top-3 sm:px-2.5 sm:py-1">
              {releaseYear}
            </div>
          )}

          {movie.providers && movie.providers.length > 0 && (
            <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              {movie.providers.slice(0, 2).map((provider) => (
                <ProviderBadge key={provider.provider_id} provider={provider} />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2 p-3 sm:space-y-3 sm:p-4">
          <h3 className="line-clamp-1 text-sm font-bold leading-tight text-gray-900 transition-colors duration-500 group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400 sm:text-base">
            {movie.title}
          </h3>

          <p className="hidden text-xs leading-relaxed text-gray-600 line-clamp-3 transition-colors duration-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300 sm:block">
            {movie.overview
              ? movie.overview.length > 50
                ? `${movie.overview.substring(0, 50)}...`
                : movie.overview
              : "No overview available."}
          </p>

          <div className="flex items-center justify-between border-t border-gray-200 pt-2 dark:border-gray-700">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {movie.release_date
                ? new Date(movie.release_date).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })
                : "Release TBA"}
            </span>
            <div className="flex items-center gap-1 rounded-full bg-gray-100 px-1.5 py-1 transition-colors duration-500 hover:bg-yellow-50 dark:bg-gray-800 dark:hover:bg-yellow-900/20 sm:px-2">
              <span className="text-yellow-500 dark:text-yellow-400">★</span>
              <span className={`text-xs font-semibold ${getRatingColor(rating)}`}>
                {rating ? rating.toFixed(1) : "NR"}
              </span>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full dark:via-white/5" />
      </div>
    </div>
  );
};

export default MovieCard;
