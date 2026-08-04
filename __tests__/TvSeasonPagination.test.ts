import type { TvEpisode, TvSeasonDetails } from "@/types/types";
import {
  latestAiredRegularSeason,
  normalizeEpisode,
  paginateSeason,
  parsePositiveInteger,
  parseSeasonNumber,
} from "@/utils/tmdb/tv";

function episode(number: number, overrides: Partial<TvEpisode> = {}): TvEpisode {
  return {
    id: number,
    name: `Episode ${number}`,
    overview: `Summary ${number}`,
    air_date: "2025-01-01",
    episode_number: number,
    season_number: 1,
    runtime: 24,
    still_path: `/episode-${number}.jpg`,
    vote_average: 8,
    vote_count: 10,
    ...overrides,
  };
}

function season(count: number): TvSeasonDetails {
  return {
    _id: "season-1",
    id: 100,
    name: "Season 1",
    overview: "",
    poster_path: null,
    season_number: 1,
    air_date: "2025-01-01",
    episodes: Array.from({ length: count }, (_, index) => episode(index + 1)),
  };
}

describe("TV season pagination", () => {
  it("returns distinct 20-episode batches for a large season", () => {
    const details = season(205);
    const first = paginateSeason(details, 1)!;
    const second = paginateSeason(details, 2)!;
    const last = paginateSeason(details, 11)!;

    expect(first).toMatchObject({ pageSize: 20, totalEpisodes: 205, totalPages: 11 });
    expect(first.episodes).toHaveLength(20);
    expect(second.episodes.map((item) => item.episodeNumber)).toEqual(Array.from({ length: 20 }, (_, index) => index + 21));
    expect(last.episodes).toHaveLength(5);
    expect(new Set([...first.episodes, ...second.episodes].map((item) => item.id))).toHaveProperty("size", 40);
    expect(paginateSeason(details, 12)).toBeNull();
  });

  it("uses the parent show's last aired episode and never defaults to Specials", () => {
    const specials = { id: 1, name: "Specials", overview: "", poster_path: null, season_number: 0, air_date: "2026-01-01", episode_count: 50 };
    const first = { id: 2, name: "Season 1", overview: "", poster_path: null, season_number: 1, air_date: "2024-01-01", episode_count: 10 };
    const future = { id: 3, name: "Season 2", overview: "", poster_path: null, season_number: 2, air_date: "2027-01-01", episode_count: 10 };

    expect(latestAiredRegularSeason({ seasons: [specials, first, future], last_episode_to_air: { season_number: 1, episode_number: 10, air_date: "2024-03-01" } })?.season_number).toBe(1);
    expect(latestAiredRegularSeason({ seasons: [specials, first, future], last_episode_to_air: null }, new Date("2026-08-04T00:00:00Z"))?.season_number).toBe(1);
  });

  it("normalizes missing records and labels future episodes unaired", () => {
    const item = normalizeEpisode(episode(3, { name: "", overview: "", air_date: "2027-01-01", runtime: null, still_path: null, vote_average: 0 }), new Date("2026-08-04T00:00:00Z"));
    expect(item).toMatchObject({
      name: "Episode 3",
      overview: "A summary is not currently available.",
      aired: false,
      runtime: null,
      stillPath: null,
      rating: null,
    });
  });

  it("strictly validates IDs, season numbers, and pages", () => {
    expect(parsePositiveInteger("1")).toBe(1);
    expect(parsePositiveInteger("0")).toBeNull();
    expect(parsePositiveInteger("1.5")).toBeNull();
    expect(parseSeasonNumber("0")).toBe(0);
    expect(parseSeasonNumber("-1")).toBeNull();
  });
});
