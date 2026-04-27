"use client";

import { QueryService } from "@/app/services/queryClient";
import { Provider, ProviderResponse } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";

export default function ProvidersPage() {
  const { data, isLoading, error } = useQuery<ProviderResponse>({
    queryKey: ["providers", "US"],
    queryFn: () => QueryService.getProviders("US"),
  });

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

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {isLoading
          ? Array.from({ length: 15 }, (_, index) => (
              <div key={index} className="h-20 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
            ))
          : data?.results?.map((provider: Provider) => (
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
    </main>
  );
}
