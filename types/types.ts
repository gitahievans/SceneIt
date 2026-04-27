export interface MovieItem {
    adult?: boolean,
    backdrop_path?: string | null,
    id: number,
    title: string,
    original_title?: string,
    overview: string,
    poster_path: string | null,
    media_type?: string,
    original_language?: string,
    genre_ids: number[],
    popularity?: number,
    release_date: string,
    video?: boolean,
    vote_average: number,
    vote_count?: number,
    runtime: number | null,
    providers?: Provider[]
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
    logo_path: string | null;
    origin_country: string;
}

export interface Video {
    iso_639_1: string;
    iso_3166_1: string;
    name: string;
    key: string;
    site: string;
    size: number;
    type: string;
    official: boolean;
    published_at: string;
    id: string;
}

export interface Provider {
    display_priority: number;
    logo_path: string | null;
    provider_id: number;
    provider_name: string;
}

export interface ProviderResponse {
    results: Provider[];
}

export interface WatchProviderRegion {
    link?: string;
    flatrate?: Provider[];
    rent?: Provider[];
    buy?: Provider[];
    ads?: Provider[];
    free?: Provider[];
}

export interface WatchProvidersResponse {
    id: number;
    results: Record<string, WatchProviderRegion>;
}

export type DiscoverFilters = {
    page?: number;
    sort_by?: string;
    with_genres?: string;
    year?: string;
    "vote_average.gte"?: string;
    "vote_average.lte"?: string;
    "vote_count.gte"?: string;
    "with_runtime.gte"?: string;
    "with_runtime.lte"?: string;
    "primary_release_date.gte"?: string;
    "primary_release_date.lte"?: string;
    watch_region?: string;
    with_watch_providers?: string;
    with_watch_monetization_types?: string;
    with_keywords?: string;
}
