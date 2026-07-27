import { tool } from "ai";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { enrichMoviesWithRuntime, tmdbServer } from "@/utils/tmdb/server";
import type {
  MovieItem,
  MovieResponse,
  Provider,
  WatchProviderRegion,
  WatchProvidersResponse,
} from "@/types/types";
import { normalizePublicHttpsUrl } from "./security";
import {
  MAX_PAGE_MARKDOWN_CHARS,
  MAX_PAGE_READS,
  MAX_SERPER_SEARCHES,
  SERPER_RESULTS_PER_SEARCH,
  type DiscoverySource,
  type ToolExecutionState,
} from "./types";

type TmdbMovieDetails = Omit<MovieItem, "genre_ids" | "runtime"> & {
  genre_ids?: number[];
  genres?: Array<{ id: number; name: string }>;
  runtime?: number | null;
  "watch/providers"?: WatchProvidersResponse;
};

type TvSearchResponse = {
  results: Array<{
    id: number;
    name: string;
    overview: string;
    first_air_date?: string;
    popularity?: number;
  }>;
};

type SerperResponse = {
  organic?: Array<{
    title?: string;
    link?: string;
    snippet?: string;
    source?: string;
  }>;
};

function recordActivity(state: ToolExecutionState, key: string) {
  state.activity.set(key, (state.activity.get(key) || 0) + 1);
}

function normalizeMovie(movie: Partial<TmdbMovieDetails> & Pick<TmdbMovieDetails, "id">): MovieItem {
  return {
    id: movie.id,
    title: movie.title || movie.original_title || "Untitled",
    original_title: movie.original_title,
    overview: movie.overview || "",
    poster_path: movie.poster_path ?? null,
    backdrop_path: movie.backdrop_path ?? null,
    genre_ids: movie.genre_ids || movie.genres?.map((genre) => genre.id) || [],
    release_date: movie.release_date || "",
    vote_average: movie.vote_average || 0,
    vote_count: movie.vote_count,
    popularity: movie.popularity,
    original_language: movie.original_language,
    adult: movie.adult,
    video: movie.video,
    media_type: "movie",
    runtime: movie.runtime ?? null,
    providers: movie.providers,
  };
}

function collectMovies(state: ToolExecutionState, movies: MovieItem[]) {
  for (const movie of movies) {
    const current = state.movies.get(movie.id);
    state.movies.set(movie.id, { ...current, ...movie, providers: movie.providers || current?.providers });
  }
}

function providersForRegion(data: WatchProvidersResponse, region: string) {
  const regionData: WatchProviderRegion | undefined = data.results?.[region];
  if (!regionData) return [];
  const providers = [
    ...(regionData.flatrate || []),
    ...(regionData.free || []),
    ...(regionData.ads || []),
    ...(regionData.rent || []),
    ...(regionData.buy || []),
  ];
  return [...new Map(providers.map((provider) => [provider.provider_id, provider])).values()];
}

async function verifyProviders(
  state: ToolExecutionState,
  movies: MovieItem[],
  providerIds: number[]
) {
  if (!providerIds.length) return movies;

  const verified = await Promise.all(
    movies.map(async (movie) => {
      try {
        const data = await tmdbServer.movieWatchProviders(String(movie.id));
        const providers = providersForRegion(data, state.region);
        if (!providerIds.every((id) => providers.some((provider) => provider.provider_id === id))) {
          return null;
        }
        return { ...movie, providers };
      } catch {
        return null;
      }
    })
  );

  return verified.filter((movie) => movie !== null);
}

async function watchedMovieIds() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Set<number>();
  const { data } = await supabase
    .from("user_movie_interactions")
    .select("movie_id")
    .eq("user_id", user.id)
    .eq("action", "watched");
  return new Set((data || []).map((row) => Number(row.movie_id)));
}

async function prepareMovies(
  state: ToolExecutionState,
  data: MovieResponse,
  limit: number,
  providerIds: number[],
  excludeWatched: boolean
) {
  const limited = { ...data, results: (data.results || []).slice(0, limit) };
  const enriched = await enrichMoviesWithRuntime(limited);
  let movies = enriched.results.map((movie) => normalizeMovie(movie));
  movies = await verifyProviders(state, movies, providerIds);
  if (excludeWatched) {
    const watched = await watchedMovieIds();
    movies = movies.filter((movie) => !watched.has(movie.id));
  }
  collectMovies(state, movies);
  return movies;
}

const movieListOutput = z.object({
  total_results: z.number(),
  movies: z.array(z.object({
    id: z.number(),
    title: z.string(),
    overview: z.string(),
    release_date: z.string(),
    vote_average: z.number(),
    runtime: z.number().nullable(),
    genre_ids: z.array(z.number()),
    providers: z.array(z.object({ provider_id: z.number(), provider_name: z.string() })).optional(),
  })),
});

export function createSceneItTools(state: ToolExecutionState) {
  return {
    discoverMovies: tool({
      description: "Discover movies using deterministic TMDB filters. Use numeric TMDB genre/provider IDs; call listMovieProviders when a provider name must be resolved.",
      inputSchema: z.object({
        genreIds: z.array(z.number().int().positive()).max(8).default([]),
        providerIds: z.array(z.number().int().positive()).max(5).default([]),
        yearMin: z.number().int().min(1880).max(2100).optional(),
        yearMax: z.number().int().min(1880).max(2100).optional(),
        ratingMin: z.number().min(0).max(10).optional(),
        ratingMax: z.number().min(0).max(10).optional(),
        runtimeMin: z.number().int().min(1).max(600).optional(),
        runtimeMax: z.number().int().min(1).max(600).optional(),
        sortBy: z.enum(["popularity.desc", "vote_average.desc", "primary_release_date.desc", "revenue.desc"]).default("popularity.desc"),
        excludeWatched: z.boolean().default(false),
        limit: z.number().int().min(1).max(12).default(10),
      }),
      outputSchema: movieListOutput,
      execute: async (input) => {
        recordActivity(state, "tmdbSearch");
        const params = new URLSearchParams({
          language: "en-US",
          include_adult: "false",
          include_video: "false",
          page: "1",
          sort_by: input.sortBy,
          "vote_count.gte": input.sortBy === "vote_average.desc" ? "100" : "20",
        });
        if (input.genreIds.length) params.set("with_genres", input.genreIds.join(","));
        if (input.providerIds.length) {
          params.set("watch_region", state.region);
          params.set("with_watch_providers", input.providerIds.join("|"));
          params.set("with_watch_monetization_types", "flatrate|free|ads|rent|buy");
        }
        if (input.yearMin) params.set("primary_release_date.gte", `${input.yearMin}-01-01`);
        if (input.yearMax) params.set("primary_release_date.lte", `${input.yearMax}-12-31`);
        if (input.ratingMin !== undefined) params.set("vote_average.gte", String(input.ratingMin));
        if (input.ratingMax !== undefined) params.set("vote_average.lte", String(input.ratingMax));
        if (input.runtimeMin) params.set("with_runtime.gte", String(input.runtimeMin));
        if (input.runtimeMax) params.set("with_runtime.lte", String(input.runtimeMax));
        const data = await tmdbServer.discoverMovies(params);
        const movies = await prepareMovies(state, data, input.limit, input.providerIds, input.excludeWatched);
        return { total_results: movies.length, movies };
      },
    }),

    searchMovies: tool({
      description: "Search TMDB for a movie title. Use for named or ambiguous films before requesting details.",
      inputSchema: z.object({
        query: z.string().trim().min(1).max(160),
        providerIds: z.array(z.number().int().positive()).max(5).default([]),
        excludeWatched: z.boolean().default(false),
        limit: z.number().int().min(1).max(10).default(5),
      }),
      outputSchema: movieListOutput,
      execute: async ({ query, providerIds, excludeWatched, limit }) => {
        recordActivity(state, "tmdbSearch");
        const data = await tmdbServer.searchMovies(query);
        const movies = await prepareMovies(state, data, limit, providerIds, excludeWatched);
        return { total_results: movies.length, movies };
      },
    }),

    getMovieDetails: tool({
      description: "Get authoritative TMDB metadata for one movie after resolving its numeric TMDB ID.",
      inputSchema: z.object({ id: z.number().int().positive() }),
      execute: async ({ id }) => {
        recordActivity(state, "tmdbDetails");
        const details = await tmdbServer.movieDetails(String(id)) as TmdbMovieDetails;
        const providers = details["watch/providers"]
          ? providersForRegion(details["watch/providers"], state.region)
          : [];
        const movie = normalizeMovie({ ...details, providers });
        collectMovies(state, [movie]);
        return movie;
      },
    }),

    getMovieWatchProviders: tool({
      description: "Verify where a movie is available in the current region using its TMDB movie ID.",
      inputSchema: z.object({ id: z.number().int().positive() }),
      execute: async ({ id }) => {
        recordActivity(state, "providers");
        const data = await tmdbServer.movieWatchProviders(String(id));
        const providers = providersForRegion(data, state.region);
        const movie = state.movies.get(id);
        if (movie) collectMovies(state, [{ ...movie, providers }]);
        return { region: state.region, providers };
      },
    }),

    listMovieProviders: tool({
      description: "List TMDB movie streaming providers for the current region and resolve a provider name to an ID.",
      inputSchema: z.object({ name: z.string().trim().max(80).optional() }),
      execute: async ({ name }) => {
        recordActivity(state, "providers");
        const data = await tmdbServer.movieProviders(state.region);
        const providers = (data.results || []).filter((provider: Provider) =>
          !name || provider.provider_name.toLowerCase().includes(name.toLowerCase())
        ).slice(0, 20);
        return { region: state.region, providers };
      },
    }),

    searchTv: tool({
      description: "Search TMDB for a television series before retrieving season or episode information.",
      inputSchema: z.object({ query: z.string().trim().min(1).max(160), limit: z.number().int().min(1).max(8).default(5) }),
      execute: async ({ query, limit }) => {
        recordActivity(state, "tv");
        const data = await tmdbServer.searchTv(query) as TvSearchResponse;
        return { results: data.results.slice(0, limit) };
      },
    }),

    getTvDetails: tool({
      description: "Get TMDB series details, including available seasons, for a resolved TV ID.",
      inputSchema: z.object({ id: z.number().int().positive() }),
      execute: async ({ id }) => {
        recordActivity(state, "tv");
        return tmdbServer.tvDetails(String(id));
      },
    }),

    getTvSeasonOrEpisode: tool({
      description: "Get authoritative TMDB synopsis data for a TV season or a specific episode.",
      inputSchema: z.object({
        tvId: z.number().int().positive(),
        seasonNumber: z.number().int().min(0).max(100),
        episodeNumber: z.number().int().min(1).max(1000).optional(),
      }),
      execute: async ({ tvId, seasonNumber, episodeNumber }) => {
        recordActivity(state, "tv");
        return episodeNumber
          ? tmdbServer.tvEpisode(String(tvId), seasonNumber, episodeNumber)
          : tmdbServer.tvSeason(String(tvId), seasonNumber);
      },
    }),

    getMyPreferences: tool({
      description: "Get the currently authenticated SceneIt user's genre interests, watched movies, favorites, and recent searches. The user identity comes only from the session.",
      inputSchema: z.object({}),
      execute: async () => {
        recordActivity(state, "preferences");
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { authenticated: false, interests: [], watched: [], favorites: [], recentSearches: [] };
        const [interests, watched, favorites, searches] = await Promise.all([
          supabase.from("user_interests").select("genre_id").eq("user_id", user.id),
          supabase.from("user_movie_interactions").select("movie_id").eq("user_id", user.id).eq("action", "watched"),
          supabase.from("user_movie_interactions").select("movie_id").eq("user_id", user.id).eq("action", "favorited"),
          supabase.from("user_searches").select("query, genre_ids").eq("user_id", user.id).limit(20),
        ]);
        return {
          authenticated: true,
          interests: (interests.data || []).map((row) => row.genre_id),
          watched: (watched.data || []).map((row) => row.movie_id),
          favorites: (favorites.data || []).map((row) => row.movie_id),
          recentSearches: searches.data || [],
        };
      },
    }),

    searchWeb: tool({
      description: "Search the public web for current release facts, interviews, reporting, or sources TMDB does not contain. Returns at most five results and exact URLs that may be read.",
      inputSchema: z.object({ query: z.string().trim().min(2).max(240) }),
      execute: async ({ query }) => {
        if (state.searchCount >= MAX_SERPER_SEARCHES) {
          return { error: `Search limit reached (${MAX_SERPER_SEARCHES} per request).`, results: [] };
        }
        state.searchCount += 1;
        recordActivity(state, "webSearch");
        const apiKey = process.env.SERPER_API_KEY;
        if (!apiKey) throw new Error("SERPER_API_KEY is not configured");
        const response = await fetch("https://google.serper.dev/search", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-API-KEY": apiKey },
          body: JSON.stringify({ q: query, num: SERPER_RESULTS_PER_SEARCH }),
          signal: AbortSignal.timeout(12_000),
        });
        if (!response.ok) throw new Error(`Serper request failed (${response.status})`);
        const data = await response.json() as SerperResponse;
        const results = (data.organic || []).flatMap((item) => {
          const url = item.link ? normalizePublicHttpsUrl(item.link) : null;
          if (!url) return [];
          const source: DiscoverySource = {
            title: item.title || new URL(url).hostname,
            url,
            snippet: item.snippet,
            source: item.source || new URL(url).hostname,
          };
          state.searchResults.set(url, source);
          return [source];
        }).slice(0, SERPER_RESULTS_PER_SEARCH);
        return { results };
      },
    }),

    readWebPage: tool({
      description: "Read one HTTPS page returned by searchWeb during this request. Use for primary-source detail or when a search snippet is insufficient.",
      inputSchema: z.object({ url: z.string().url() }),
      execute: async ({ url: inputUrl }) => {
        if (state.pageReadCount >= MAX_PAGE_READS) {
          return { error: `Page-read limit reached (${MAX_PAGE_READS} per request).` };
        }
        const url = normalizePublicHttpsUrl(inputUrl);
        if (!url) return { error: "Only public HTTPS URLs can be read." };
        const source = state.searchResults.get(url);
        if (!source) return { error: "This URL was not returned by searchWeb during this request." };
        state.pageReadCount += 1;
        recordActivity(state, "pageRead");
        const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
        const apiToken = process.env.CLOUDFLARE_API_TOKEN;
        if (!accountId || !apiToken) throw new Error("Cloudflare Browser Rendering credentials are not configured");
        const response = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/browser-rendering/markdown`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${apiToken}`, "Content-Type": "application/json" },
            body: JSON.stringify({ url }),
            signal: AbortSignal.timeout(20_000),
          }
        );
        if (!response.ok) throw new Error(`Cloudflare page read failed (${response.status})`);
        const data = await response.json() as { result?: string | { markdown?: string }; success?: boolean };
        const markdown = typeof data.result === "string" ? data.result : data.result?.markdown || "";
        const truncated = markdown.length > MAX_PAGE_MARKDOWN_CHARS;
        state.readSources.set(url, source);
        return {
          title: source.title,
          url,
          markdown: markdown.slice(0, MAX_PAGE_MARKDOWN_CHARS),
          truncated,
        };
      },
    }),
  };
}
