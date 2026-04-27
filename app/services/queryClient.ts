// app/services/queryClient.ts
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
const FALLBACK_POSTER = "/assets/icon.png";

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
    discoverMovies: (params: Record<string, string | number | undefined> = {}) => {
        const query = discoverParams(params);
        return fetchFromAPI(`/api/tmdb/discover${query ? `?${query}` : ""}`);
    },
    getDailyTrending: () => fetchFromAPI("/api/tmdb/trending"),
    getGenres: () => fetchFromAPI("/api/tmdb/genres"),
    getMoviesByGenre: (genreId: number, page: number = 1) => fetchFromAPI(`/api/tmdb/discover?with_genres=${genreId}&page=${page}`),
    getMovieDetails: (id: number) => fetchFromAPI(`/api/tmdb/movies/${id}`),
    searchMovies: (query: string) => {
        const encodedQuery = encodeURIComponent(query.trim());
        return fetchFromAPI(`/api/tmdb/search?query=${encodedQuery}`);
    },
    searchMoviesWithPage: (query: string, page: number = 1) => {
        const encodedQuery = encodeURIComponent(query.trim());
        return fetchFromAPI(`/api/tmdb/search?query=${encodedQuery}&page=${page}`);
    },
    getPoster: (path?: string | null, size?: string) => path ? `${IMAGE_BASE_URL}/${size || "w500"}${path}` : FALLBACK_POSTER,
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
