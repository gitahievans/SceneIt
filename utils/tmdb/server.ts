import { MovieResponse, ProviderResponse, WatchProvidersResponse } from "@/types/types";

const BASE_URL = "https://api.themoviedb.org/3";

const API_KEY = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;
const ACCESS_TOKEN =
  process.env.TMDB_READ_ACCESS_TOKEN || process.env.NEXT_PUBLIC_TMDB_READ_ACCESS_TOKEN;

function getAuthHeaders() {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (ACCESS_TOKEN) {
    headers.Authorization = `Bearer ${ACCESS_TOKEN}`;
  }

  return headers;
}

function buildUrl(endpoint: string, params?: URLSearchParams) {
  const url = new URL(`${BASE_URL}${endpoint}`);

  if (params) {
    params.forEach((value, key) => {
      if (value) url.searchParams.set(key, value);
    });
  }

  if (!ACCESS_TOKEN && API_KEY) {
    url.searchParams.set("api_key", API_KEY);
  }

  return url;
}

export async function fetchTmdb<T>(endpoint: string, params?: URLSearchParams): Promise<T> {
  if (!ACCESS_TOKEN && !API_KEY) {
    throw new Error("TMDB credentials are not configured");
  }

  const response = await fetch(buildUrl(endpoint, params), {
    headers: getAuthHeaders(),
    next: { revalidate: 60 * 30 },
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(`TMDB request failed (${response.status}): ${details || response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export function toSearchParams(
  input: URLSearchParams,
  allowedKeys: string[],
  defaults: Record<string, string> = {}
) {
  const params = new URLSearchParams(defaults);

  allowedKeys.forEach((key) => {
    const value = input.get(key);
    if (value) params.set(key, value);
  });

  return params;
}

export const tmdbServer = {
  discoverMovies: (params: URLSearchParams) => fetchTmdb<MovieResponse>("/discover/movie", params),
  genres: () => fetchTmdb("/genre/movie/list", new URLSearchParams({ language: "en-US" })),
  movieProviders: (region = "US") =>
    fetchTmdb<ProviderResponse>(
      "/watch/providers/movie",
      new URLSearchParams({ language: "en-US", watch_region: region })
    ),
  movieDetails: (id: string) =>
    fetchTmdb(
      `/movie/${id}`,
      new URLSearchParams({
        language: "en-US",
        append_to_response: "videos,images,recommendations,similar,watch/providers,credits,keywords,release_dates",
      })
    ),
  movieWatchProviders: (id: string) =>
    fetchTmdb<WatchProvidersResponse>(`/movie/${id}/watch/providers`),
  searchMovies: (query: string, page = "1") =>
    fetchTmdb<MovieResponse>(
      "/search/movie",
      new URLSearchParams({ language: "en-US", query, page })
    ),
};
