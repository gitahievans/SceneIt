"use client";

import { MovieItem } from "@/types/types";
import MovieCard from "./MovieCard";

type MovieGridProps = {
  movies: MovieItem[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
};

const skeletons = Array.from({ length: 12 }, (_, index) => index);

export default function MovieGrid({
  movies,
  isLoading = false,
  emptyTitle = "No movies found",
  emptyDescription = "Try adjusting your filters or checking again later.",
}: MovieGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
        {skeletons.map((item) => (
          <div key={item} className="animate-pulse">
            <div className="aspect-[2/3] rounded-lg bg-gray-200 dark:bg-gray-800" />
            <div className="mt-3 h-4 rounded bg-gray-200 dark:bg-gray-800" />
            <div className="mt-2 h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-800" />
          </div>
        ))}
      </div>
    );
  }

  if (!movies.length) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 p-10 text-center dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{emptyTitle}</h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
}
