export interface MovieItem {
    adult?: boolean,
    backdrop_path?: string | null,
    id: number,
    title: string,
    name?: string,
    original_title?: string,
    overview: string,
    poster_path: string | null,
    media_type?: string,
    original_language?: string,
    genre_ids: number[],
    popularity?: number,
    release_date: string,
    first_air_date?: string,
    video?: boolean,
    vote_average: number,
    vote_count?: number,
    runtime: number | null,
    providers?: Provider[]
}

export type ContentKind = "movie" | "tv";

export type MediaType = "movie" | "tv";

export type InteractionRequest = {
    media_type: MediaType;
    media_id: number;
    action: "favorited" | "unfavorited";
    rating?: number;
};

export type FavoriteReference = {
    mediaType: MediaType;
    mediaId: number;
};

export interface HeroCandidate {
    kind: ContentKind;
    id: number;
    title: string;
    overview: string;
    rating: number;
    posterPath: string | null;
    backdropPath: string;
    trailerKey?: string;
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

export interface TvSeasonSummary {
    id: number;
    name: string;
    overview: string;
    poster_path: string | null;
    season_number: number;
    air_date: string | null;
    episode_count: number;
    vote_average?: number;
}

export interface TvEpisode {
    id: number;
    name: string;
    overview: string;
    air_date: string | null;
    episode_number: number;
    season_number: number;
    runtime: number | null;
    still_path: string | null;
    vote_average: number | null;
    vote_count: number;
}

export interface TvSeasonDetails {
    _id: string;
    id: number;
    name: string;
    overview: string;
    poster_path: string | null;
    season_number: number;
    air_date: string | null;
    episodes: TvEpisode[];
}

export interface TvDetails {
    id: number;
    name: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    first_air_date: string;
    last_air_date: string;
    number_of_seasons: number;
    number_of_episodes: number;
    seasons: TvSeasonSummary[];
    last_episode_to_air?: {
        air_date: string | null;
        episode_number: number;
        season_number: number;
    } | null;
}

export interface TvEpisodeListItem {
    id: number;
    seasonNumber: number;
    episodeNumber: number;
    name: string;
    overview: string;
    airDate: string | null;
    runtime: number | null;
    rating: number | null;
    voteCount: number;
    stillPath: string | null;
    aired: boolean;
}

export interface TvEpisodePage {
    seasonNumber: number;
    page: number;
    pageSize: 20;
    totalEpisodes: number;
    totalPages: number;
    episodes: TvEpisodeListItem[];
}
