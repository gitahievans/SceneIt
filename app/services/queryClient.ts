const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const ACCESS_TOKEN = process.env.NEXT_PUBLIC_TMDB_ACCESS_TOKEN;
const BASE_URL = "https://api.themoviedb.org/3";


async function fetchFromAPI(endpoint: string) {
    const res = await fetch(`${BASE_URL}${endpoint}?api_key=${API_KEY}`, {
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
    getWeeklyTrending: () => fetchFromAPI("/trending/movie/week"),
    getMovieDetails: (id: number) => fetchFromAPI(`/movie/${id}`),
    searchMovies: (query: string) => fetchFromAPI(`/search/movie&query=${query}`),
    getPoster: (path: string) => `https://image.tmdb.org/t/p/w500${path}`,
}