"use client";

import DiscoveryControls from "@/components/Common/DiscoveryControls";
import MovieGrid from "@/components/Common/MovieGrid";
import { QueryService } from "@/app/services/queryClient";
import { Genre, MovieResponse } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

export default function GenrePage() {
  const params = useParams<{ genreId: string }>();
  const genreId = Number(params.genreId);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("popularity.desc");
  const [minRating, setMinRating] = useState("");
  const [maxRuntime, setMaxRuntime] = useState("");
  const [year, setYear] = useState("");

  const { data: genresData } = useQuery({
    queryKey: ["genres"],
    queryFn: QueryService.getGenres,
  });

  const genreName = useMemo(() => {
    return genresData?.genres?.find((genre: Genre) => genre.id === genreId)?.name || "Genre";
  }, [genresData, genreId]);

  const { data, isLoading, error } = useQuery<MovieResponse>({
    queryKey: ["genre-page", genreId, page, sortBy, minRating, maxRuntime, year],
    queryFn: () =>
      QueryService.discoverMovies({
        with_genres: genreId,
        page,
        sort_by: sortBy,
        "vote_average.gte": minRating,
        "with_runtime.lte": maxRuntime,
        year,
        "vote_count.gte": sortBy === "vote_average.desc" ? 200 : 50,
      }),
    enabled: Number.isFinite(genreId),
  });

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <div>
        <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Browse by genre</p>
        <h1 className="mt-1 text-3xl font-bold text-gray-950 dark:text-white">{genreName} Movies</h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
          Explore more than the homepage carousel with sorting, pagination, and practical filters.
        </p>
      </div>

      <DiscoveryControls
        sortBy={sortBy}
        setSortBy={(value) => {
          setSortBy(value);
          setPage(1);
        }}
        minRating={minRating}
        setMinRating={(value) => {
          setMinRating(value);
          setPage(1);
        }}
        maxRuntime={maxRuntime}
        setMaxRuntime={(value) => {
          setMaxRuntime(value);
          setPage(1);
        }}
        year={year}
        setYear={(value) => {
          setYear(value);
          setPage(1);
        }}
      />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error instanceof Error ? error.message : "Failed to load movies."}
        </div>
      )}

      <MovieGrid movies={data?.results || []} isLoading={isLoading} />

      <div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-800">
        <button
          onClick={() => setPage((current) => Math.max(1, current - 1))}
          disabled={page === 1 || isLoading}
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200"
        >
          <ChevronLeft size={16} />
          Previous
        </button>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Page {page} of {data?.total_pages || 1}
        </span>
        <button
          onClick={() => setPage((current) => current + 1)}
          disabled={isLoading || page >= (data?.total_pages || 1)}
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </main>
  );
}
