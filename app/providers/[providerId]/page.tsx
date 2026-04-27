"use client";

import DiscoveryControls from "@/components/Common/DiscoveryControls";
import MovieGrid from "@/components/Common/MovieGrid";
import { QueryService } from "@/app/services/queryClient";
import { MovieResponse, ProviderResponse } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function ProviderPage() {
  const params = useParams<{ providerId: string }>();
  const providerId = params.providerId;
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("popularity.desc");
  const [minRating, setMinRating] = useState("");
  const [maxRuntime, setMaxRuntime] = useState("");
  const [year, setYear] = useState("");
  const [monetization, setMonetization] = useState("flatrate");

  const { data: providersData } = useQuery<ProviderResponse>({
    queryKey: ["providers", "US"],
    queryFn: () => QueryService.getProviders("US"),
  });

  const selectedProvider = providersData?.results?.find(
    (provider) => String(provider.provider_id) === providerId
  );
  const providerName = selectedProvider?.provider_name || "Provider";

  const { data, isLoading, error } = useQuery<MovieResponse>({
    queryKey: ["provider-page", providerId, page, sortBy, minRating, maxRuntime, year, monetization],
    queryFn: () =>
      QueryService.discoverMovies({
        with_watch_providers: providerId,
        watch_region: "US",
        with_watch_monetization_types: monetization,
        page,
        sort_by: sortBy,
        "vote_average.gte": minRating,
        "with_runtime.lte": maxRuntime,
        year,
        "vote_count.gte": sortBy === "vote_average.desc" ? 200 : 50,
      }),
  });

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <div>
        <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Available to watch</p>
        <h1 className="mt-1 text-3xl font-bold text-gray-950 dark:text-white">{providerName} Movies</h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
          Discover movies available through {providerName}. Region defaults to US for this first pass.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_220px]">
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
        <label className="rounded-lg border border-gray-200 bg-white p-3 text-sm font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
          Availability
          <select
            value={monetization}
            onChange={(event) => {
              setMonetization(event.target.value);
              setPage(1);
            }}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="flatrate">Streaming</option>
            <option value="free">Free</option>
            <option value="ads">With ads</option>
            <option value="rent">Rent</option>
            <option value="buy">Buy</option>
          </select>
        </label>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error instanceof Error ? error.message : "Failed to load movies."}
        </div>
      )}

      <MovieGrid
        movies={
          selectedProvider
            ? (data?.results || []).map((movie) => ({
                ...movie,
                providers: [selectedProvider],
              }))
            : data?.results || []
        }
        isLoading={isLoading}
      />

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
