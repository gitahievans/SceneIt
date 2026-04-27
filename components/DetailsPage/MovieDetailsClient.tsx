"use client";

import { QueryService } from "@/app/services/queryClient";
import { Company, Genre, Provider } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import LikeButton from "./LikeButton";
import Loading from "../Common/Loader";
import ProviderBadge from "../Common/ProviderBadge";
import WatchButton from "../Player/WatchButton";

const formatCurrency = (amount?: number) => {
  if (!amount) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatRuntime = (minutes?: number | null) => {
  if (!minutes) return "N/A";
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return hours > 0 ? `${hours}h ${remainingMinutes}m` : `${remainingMinutes}m`;
};

const getRatingColor = (rating?: number) => {
  if (!rating) return "text-gray-300";
  if (rating >= 8) return "text-green-500";
  if (rating >= 6) return "text-yellow-500";
  return "text-red-500";
};

const MovieDetailsClient = ({ movieId }: { movieId: number }) => {
  const { getMovieDetails, getPoster } = QueryService;

  const { data: movie, isLoading, error } = useQuery({
    queryKey: ["movie-details", movieId],
    queryFn: () => getMovieDetails(movieId),
    enabled: !!movieId,
  });

  const usProviders = movie?.["watch/providers"]?.results?.US;
  const streamProviders: Provider[] = usProviders?.flatrate || [];

  if (isLoading) return <Loading />;

  if (error || !movie) {
    return (
      <div className="min-h-[60vh] bg-gray-900 px-6 py-20 text-center text-white">
        <h1 className="text-2xl font-bold">Movie details are unavailable</h1>
        <p className="mt-2 text-gray-300">
          {error instanceof Error ? error.message : "Try opening this movie again later."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="relative lg:h-screen">
        <div className="absolute inset-0">
          <Image
            src={getPoster(movie.backdrop_path, "w1280")}
            alt={`${movie.title} backdrop`}
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-transparent to-gray-900/40" />
        </div>

        <div className="relative z-10 flex h-full items-center">
          <div className="mx-auto w-full max-w-7xl px-6">
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
              <div className="lg:col-span-4 xl:col-span-3">
                <div className="relative mx-auto aspect-[2/3] w-80 overflow-hidden rounded-2xl shadow-2xl lg:mx-0 lg:w-full">
                  <Image
                    src={getPoster(movie.poster_path, "w500")}
                    alt={`${movie.title} poster`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>

              <div className="space-y-6 text-white lg:col-span-8 xl:col-span-9">
                <div>
                  <h1 className="mb-4 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                    {movie.title}
                  </h1>
                  {movie.tagline && (
                    <p className="mb-6 text-lg italic text-gray-300 md:text-xl">{movie.tagline}</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-6 text-sm md:text-base">
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-400">★</span>
                    <span className={`font-semibold ${getRatingColor(movie.vote_average)}`}>
                      {movie.vote_average ? movie.vote_average.toFixed(1) : "NR"}
                    </span>
                    <span className="text-gray-400">({movie.vote_count || 0} votes)</span>
                  </div>
                  <div className="text-gray-300">
                    {movie.release_date ? new Date(movie.release_date).getFullYear() : "TBA"}
                  </div>
                  <div className="text-gray-300">{formatRuntime(movie.runtime)}</div>
                </div>

                {movie.genres?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {movie.genres.map((genre: Genre) => (
                      <span
                        key={genre.id}
                        className="rounded-full border border-white/30 bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                )}

                <div className="max-w-3xl">
                  <p className="text-lg leading-relaxed text-gray-200 md:text-xl">
                    {movie.overview || "No overview available."}
                  </p>
                </div>

                {streamProviders.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-gray-300">Streaming on</span>
                    {streamProviders.slice(0, 4).map((provider) => (
                      <ProviderBadge key={provider.provider_id} provider={provider} />
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 pt-4">
                  <LikeButton movieId={movieId} />
                  <WatchButton movieId={movieId} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-transparent p-8 shadow-2xl shadow-amber-50/30 backdrop-blur-md">
              <h2 className="mb-6 text-2xl font-bold text-white">Movie Details</h2>
              <div className="space-y-4">
                <DetailRow
                  label="Release Date"
                  value={
                    movie.release_date
                      ? new Date(movie.release_date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "TBA"
                  }
                />
                <DetailRow label="Runtime" value={formatRuntime(movie.runtime)} />
                <DetailRow label="Budget" value={formatCurrency(movie.budget)} />
                <DetailRow label="Revenue" value={formatCurrency(movie.revenue)} />
                <DetailRow label="Status" value={movie.status || "N/A"} />
                <DetailRow label="Language" value={movie.spoken_languages?.[0]?.english_name || "N/A"} />
                <DetailRow label="Country" value={movie.production_countries?.[0]?.name || "N/A"} isLast />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-transparent p-8 shadow-2xl shadow-amber-50/30 backdrop-blur-md">
              <h2 className="mb-6 text-2xl font-bold text-white">Production</h2>
              <div className="space-y-6">
                {movie.production_companies?.length ? (
                  movie.production_companies.map((company: Company) => (
                    <div key={company.id} className="flex items-center space-x-4">
                      {company.logo_path && (
                        <div className="h-16 w-16 flex-shrink-0 rounded-lg bg-white p-2">
                          <Image
                            src={getPoster(company.logo_path, "w200")}
                            alt={`${company.name} logo`}
                            width={60}
                            height={60}
                            className="h-full w-full object-contain"
                            unoptimized
                          />
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium text-white">{company.name}</h3>
                        <p className="text-sm text-gray-400">{company.origin_country || "N/A"}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">No production company data available.</p>
                )}
              </div>

              <div className="mt-8 border-t border-gray-700 pt-6">
                <div className="flex flex-wrap gap-4">
                  {movie.homepage && (
                    <a
                      href={movie.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
                    >
                      Official Website
                    </a>
                  )}
                  {movie.imdb_id && (
                    <a
                      href={`https://www.imdb.com/title/${movie.imdb_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-yellow-600 px-6 py-3 font-medium text-white transition-colors hover:bg-yellow-700"
                    >
                      IMDb
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

function DetailRow({ label, value, isLast = false }: { label: string; value: string; isLast?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-2 ${isLast ? "" : "border-b border-gray-700"}`}>
      <span className="text-gray-400">{label}</span>
      <span className="text-right font-medium text-white">{value}</span>
    </div>
  );
}

export default MovieDetailsClient;
