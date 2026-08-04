// app/services/queryClient.ts
import { tmdbImageUrl } from "@/utils/tmdb/image";

async function fetchFromAPI(endpoint: string) {
    const res = await fetch(endpoint);
    if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.error || "Failed to fetch data");
    }
    return res.json();
}

function discoverParams(params: Record<string, string | number | undefined>) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
            searchParams.set(key, String(value));
        }
    });
    return searchParams.toString();
}

export const QueryService = {
    discover: (kind: "movie" | "tv", params: Record<string, string | number | undefined> = {}) => {
        const query = discoverParams(params);
        return fetchFromAPI(`/api/tmdb/discover?kind=${kind}${query ? `&${query}` : ""}`);
    },
    discoverMovies: (params: Record<string, string | number | undefined> = {}) => QueryService.discover("movie", params),
    getDailyTrending: () => fetchFromAPI("/api/tmdb/trending"),
    getGenres: (kind: "movie" | "tv" = "movie") => fetchFromAPI(`/api/tmdb/genres?kind=${kind}`),
    getMoviesByGenre: (genreId: number, page: number = 1) => fetchFromAPI(`/api/tmdb/discover?with_genres=${genreId}&page=${page}`),
    getMovieDetails: (id: number) => fetchFromAPI(`/api/tmdb/movies/${id}`),
    getTvDetails: (id: number) => fetchFromAPI(`/api/tmdb/tv/${id}`),
    searchMovies: (query: string) => {
        const encodedQuery = encodeURIComponent(query.trim());
        return fetchFromAPI(`/api/tmdb/search?query=${encodedQuery}`);
    },
    searchTv: (query: string) => {
        const encodedQuery = encodeURIComponent(query.trim());
        return fetchFromAPI(`/api/tmdb/search?kind=tv&query=${encodedQuery}`);
    },
    searchMoviesWithPage: (query: string, page: number = 1) => {
        const encodedQuery = encodeURIComponent(query.trim());
        return fetchFromAPI(`/api/tmdb/search?query=${encodedQuery}&page=${page}`);
    },
    getPoster: (path?: string | null, size = "w500") => tmdbImageUrl(path, "poster", size as "w500") || "/assets/poster-placeholder.svg",
    getSimilar: async (id: number) => {
        const details = await fetchFromAPI(`/api/tmdb/movies/${id}`);
        return details.similar || { results: [] };
    },
    getPopular: () => fetchFromAPI("/api/tmdb/discover?sort_by=popularity.desc&page=1"),
    getNowPlaying: () => fetchFromAPI("/api/tmdb/discover?sort_by=primary_release_date.desc&page=1"),
    getTopRated: () => fetchFromAPI("/api/tmdb/discover?sort_by=vote_average.desc&vote_count.gte=300&page=1"),
    getRecommendations: async (id: number) => {
        const details = await fetchFromAPI(`/api/tmdb/movies/${id}`);
        return details.recommendations || { results: [] };
    },
    getMovieVideos: async (id: number) => {
        const details = await fetchFromAPI(`/api/tmdb/movies/${id}`);
        return details.videos || { results: [] };
    },
    getPopularMovies: () => fetchFromAPI("/api/tmdb/discover?sort_by=popularity.desc&page=1"),
    getProviders: (region = "US") => fetchFromAPI(`/api/tmdb/providers?region=${region}`),
    getMovieWatchProviders: (id: number) => fetchFromAPI(`/api/tmdb/movies/${id}/watch-providers`),
    getTvShowsGenreList: () => fetchFromAPI("/api/tmdb/genres"),
    getMoviesGenreList: () => fetchFromAPI("/api/tmdb/genres"),
}
