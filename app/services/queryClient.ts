const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const ACCESS_TOKEN = process.env.TMDB_READ_ACCESS_TOKEN;
const BASE_URL = "https://api.themoviedb.org/3";

console.log("API_KEY:", process.env.NEXT_PUBLIC_TMDB_API_KEY);
console.log("ACCESS_TOKEN:", process.env.TMDB_READ_ACCESS_TOKEN);

async function fetchFromAPI(endpoint: string) {
    const separator = endpoint.includes("?") ? "&" : "?";
    const res = await fetch(`${BASE_URL}${endpoint}${separator}api_key=${API_KEY}`, {
        headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            Accept: "application/json",
        }
    });
    if (!res.ok) throw new Error("Failed to fetch data");
    return res.json();
}

export const QueryService = {
    getDailyTrending: () => fetchFromAPI("/trending/movie/day"),
    getGenres: () => fetchFromAPI("/genre/movie/list"),
    getMoviesByGenre: (genreId: number) => fetchFromAPI(`/discover/movie?with_genres=${genreId}`),
    getMovieDetails: (id: number) => fetchFromAPI(`/movie/${id}`),
    searchMovies: (query: string) => {
        const encodedQuery = encodeURIComponent(query.trim());
        return fetchFromAPI(`/search/movie?query=${encodedQuery}`);
    },
    searchMoviesWithPage: (query: string, page: number = 1) => {
        const encodedQuery = encodeURIComponent(query.trim());
        return fetchFromAPI(`/search/movie?query=${encodedQuery}&page=${page}`);
    },
    getPoster: (path: string, size?: string) => `https://image.tmdb.org/t/p/${size || "w500"}${path}`,
    getSimilar: (id: number) => fetchFromAPI(`/movie/${id}/similar`),
    getPopular: () => fetchFromAPI("/movie/popular"),
    getNowPlaying: () => fetchFromAPI("/movie/now_playing"),
    getTopRated: () => fetchFromAPI("/movie/top_rated"),
    getRecommendations: (id: number) => fetchFromAPI(`/movie/${id}/recommendations`),
}