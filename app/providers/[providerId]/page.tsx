"use client";

import DiscoveryControls from "@/components/Common/DiscoveryControls";
import MovieGrid from "@/components/Common/MovieGrid";
import { QueryService } from "@/app/services/queryClient";
import { MovieResponse, ProviderResponse } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function ProviderPage() {
  const params = useParams<{ providerId: string }>();
  const router = useRouter();
  const providerId = params.providerId;
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("popularity.desc");
  const [ratingMin, setRatingMin] = useState("");
  const [ratingMax, setRatingMax] = useState("");
  const [runtimeMin, setRuntimeMin] = useState("");
  const [runtimeMax, setRuntimeMax] = useState("");
  const [yearMin, setYearMin] = useState("");
  const [yearMax, setYearMax] = useState("");
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
    queryKey: [
      "provider-page",
      providerId,
      page,
      sortBy,
      ratingMin,
      ratingMax,
      runtimeMin,
      runtimeMax,
      yearMin,
      yearMax,
      monetization,
    ],
    queryFn: () =>
      QueryService.discoverMovies({
        with_watch_providers: providerId,
        watch_region: "US",
        with_watch_monetization_types: monetization,
        page,
        sort_by: sortBy,
        "vote_average.gte": ratingMin,
        "vote_average.lte": ratingMax,
        "with_runtime.gte": runtimeMin,
        "with_runtime.lte": runtimeMax,
        "primary_release_date.gte": yearMin ? `${yearMin}-01-01` : undefined,
        "primary_release_date.lte": yearMax ? `${yearMax}-12-31` : undefined,
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

      <div className="grid gap-3 md:grid-cols-[minmax(220px,320px)_1fr_220px]">
        <label className="rounded-lg border border-gray-200 bg-white p-3 text-sm font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
          Provider
          <div className="mt-1 flex items-center gap-2">
            {selectedProvider?.logo_path && (
              <Image
                src={QueryService.getPoster(selectedProvider.logo_path, "w45")}
                alt=""
                width={28}
                height={28}
                className="rounded"
                unoptimized
              />
            )}
            <select
              value={providerId}
              onChange={(event) => {
                setPage(1);
                const provider = providersData?.results?.find(
                  (item) => String(item.provider_id) === event.target.value
                );
                router.push(
                  `/providers/${event.target.value}${
                    provider ? `?name=${encodeURIComponent(provider.provider_name)}` : ""
                  }`
                );
              }}
              className="min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              {(providersData?.results || []).map((provider) => (
                <option key={provider.provider_id} value={provider.provider_id}>
                  {provider.provider_name}
                </option>
              ))}
            </select>
          </div>
        </label>

        <DiscoveryControls
          sortBy={sortBy}
          setSortBy={(value) => {
            setSortBy(value);
            setPage(1);
          }}
          ratingMin={ratingMin}
          setRatingMin={(value) => {
            setRatingMin(value);
            setPage(1);
          }}
          ratingMax={ratingMax}
          setRatingMax={(value) => {
            setRatingMax(value);
            setPage(1);
          }}
          runtimeMin={runtimeMin}
          setRuntimeMin={(value) => {
            setRuntimeMin(value);
            setPage(1);
          }}
          runtimeMax={runtimeMax}
          setRuntimeMax={(value) => {
            setRuntimeMax(value);
            setPage(1);
          }}
          yearMin={yearMin}
          setYearMin={(value) => {
            setYearMin(value);
            setPage(1);
          }}
          yearMax={yearMax}
          setYearMax={(value) => {
            setYearMax(value);
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
