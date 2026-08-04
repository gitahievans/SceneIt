import type {
  TvDetails,
  TvEpisode,
  TvEpisodeListItem,
  TvEpisodePage,
  TvSeasonDetails,
  TvSeasonSummary,
} from "@/types/types";

export const TV_EPISODE_PAGE_SIZE = 20 as const;

export function parsePositiveInteger(value: string | null | undefined) {
  return value && /^\d+$/.test(value) && Number(value) > 0 ? Number(value) : null;
}

export function parseSeasonNumber(value: string | null | undefined) {
  return value && /^\d+$/.test(value) ? Number(value) : null;
}

export function findSeason(show: Pick<TvDetails, "seasons">, seasonNumber: number) {
  return show.seasons.find((season) => season.season_number === seasonNumber) || null;
}

export function latestAiredRegularSeason(
  show: Pick<TvDetails, "seasons" | "last_episode_to_air">,
  today = new Date()
): TvSeasonSummary | null {
  const lastAiredSeason = show.last_episode_to_air?.season_number;
  if (lastAiredSeason && lastAiredSeason > 0) {
    const summary = findSeason(show, lastAiredSeason);
    if (summary) return summary;
  }

  const todayKey = today.toISOString().slice(0, 10);
  return [...show.seasons]
    .filter((season) =>
      season.season_number > 0 &&
      season.episode_count > 0 &&
      Boolean(season.air_date) &&
      season.air_date! <= todayKey
    )
    .sort((a, b) => b.season_number - a.season_number)[0] || null;
}

export function normalizeEpisode(episode: TvEpisode, today = new Date()): TvEpisodeListItem {
  const todayKey = today.toISOString().slice(0, 10);
  const airDate = episode.air_date || null;
  return {
    id: episode.id,
    seasonNumber: episode.season_number,
    episodeNumber: episode.episode_number,
    name: episode.name?.trim() || `Episode ${episode.episode_number}`,
    overview: episode.overview?.trim() || "A summary is not currently available.",
    airDate,
    runtime: episode.runtime || null,
    rating: episode.vote_average || null,
    voteCount: episode.vote_count || 0,
    stillPath: episode.still_path || null,
    aired: Boolean(airDate && airDate <= todayKey),
  };
}

export function paginateSeason(
  season: Pick<TvSeasonDetails, "season_number" | "episodes">,
  page: number,
  today = new Date()
): TvEpisodePage | null {
  if (!Number.isInteger(page) || page < 1) return null;
  const totalEpisodes = season.episodes.length;
  const totalPages = Math.max(1, Math.ceil(totalEpisodes / TV_EPISODE_PAGE_SIZE));
  if (page > totalPages) return null;
  const start = (page - 1) * TV_EPISODE_PAGE_SIZE;
  return {
    seasonNumber: season.season_number,
    page,
    pageSize: TV_EPISODE_PAGE_SIZE,
    totalEpisodes,
    totalPages,
    episodes: season.episodes
      .slice(start, start + TV_EPISODE_PAGE_SIZE)
      .map((episode) => normalizeEpisode(episode, today)),
  };
}
