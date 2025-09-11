export interface MovieItem {
    adult: boolean,
    backdrop_path: string,
    id: number,
    title: string,
    original_title: string,
    overview: string,
    poster_path: string,
    media_type: string,
    original_language: string,
    genre_ids: number[],
    popularity: number,
    release_date: string,
    video: boolean,
    vote_average: number,
    vote_count: number
}

export interface MovieResponse {
    page: number;
    results: MovieItem[];
    total_pages: number;
    total_results: number;
}

export interface Genre {
    id: number;
    name: string;
}

export interface GenreResponse {
    genres: Genre[];
}

export type Company = {
    id: number;
    name: string;
    logo_path: string;
    origin_country: string;
}