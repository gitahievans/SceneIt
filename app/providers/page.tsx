"use client";

import { QueryService } from "@/app/services/queryClient";
import { Provider, ProviderResponse } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function ProvidersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data, isLoading, error } = useQuery<ProviderResponse>({
    queryKey: ["providers", "US"],
    queryFn: () => QueryService.getProviders("US"),
  });

  const filteredProviders = useMemo(() => {
    const providers = data?.results || [];
    const query = searchTerm.trim().toLowerCase();
    if (!query) return providers;

    return providers.filter((provider) =>
      provider.provider_name.toLowerCase().includes(query)
    );
  }, [data?.results, searchTerm]);

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <div>
        <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Streaming providers</p>
        <h1 className="mt-1 text-3xl font-bold text-gray-950 dark:text-white">Watch By Provider</h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
          Browse movies available through streaming providers. The first version defaults to US availability.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error instanceof Error ? error.message : "Failed to load providers."}
        </div>
      )}

      <div className="relative max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Search providers, e.g. Netflix, Apple TV, Max..."
          className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:ring-orange-950"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {isLoading
          ? Array.from({ length: 15 }, (_, index) => (
              <div key={index} className="h-20 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
            ))
          : filteredProviders.map((provider: Provider) => (
              <Link
                key={provider.provider_id}
                href={`/providers/${provider.provider_id}?name=${encodeURIComponent(provider.provider_name)}`}
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 transition hover:border-orange-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-orange-700"
              >
                {provider.logo_path && (
                  <Image
                    src={QueryService.getPoster(provider.logo_path, "w92")}
                    alt=""
                    width={40}
                    height={40}
                    className="rounded-lg"
                    unoptimized
                  />
                )}
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {provider.provider_name}
                </span>
              </Link>
            ))}
      </div>

      {!isLoading && filteredProviders.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-300 p-10 text-center dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">No providers found</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Try another provider name.</p>
        </div>
      )}
    </main>
  );
}
