/** @jest-environment node */

const mockTvDetails = jest.fn();
const mockTvSeason = jest.fn();

jest.mock("@/utils/tmdb/server", () => ({
  tmdbServer: {
    tvDetails: (...args: unknown[]) => mockTvDetails(...args),
    tvSeason: (...args: unknown[]) => mockTvSeason(...args),
  },
}));

import { GET } from "@/app/api/tmdb/tv/[id]/seasons/[seasonNumber]/episodes/route";

const summary = { id: 10, name: "Season 1", overview: "", poster_path: null, season_number: 1, air_date: "2025-01-01", episode_count: 25 };

describe("GET TV episode pages", () => {
  beforeEach(() => {
    mockTvDetails.mockReset().mockResolvedValue({ id: 99, name: "Show", seasons: [summary] });
    mockTvSeason.mockReset().mockResolvedValue({
      id: 10,
      season_number: 1,
      episodes: Array.from({ length: 25 }, (_, index) => ({
        id: index + 1,
        name: `Episode ${index + 1}`,
        overview: "",
        air_date: "2025-01-01",
        episode_number: index + 1,
        season_number: 1,
        runtime: null,
        still_path: null,
        vote_average: 0,
        vote_count: 0,
      })),
    });
  });

  it("returns only the requested normalized batch", async () => {
    const response = await GET(new Request("http://localhost/api/episodes?page=2"), { params: Promise.resolve({ id: "99", seasonNumber: "1" }) });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({ seasonNumber: 1, page: 2, pageSize: 20, totalEpisodes: 25, totalPages: 2 });
    expect(body.episodes).toHaveLength(5);
    expect(body.episodes[0]).toMatchObject({ episodeNumber: 21, seasonNumber: 1, stillPath: null });
  });

  it("rejects malformed and out-of-range pages", async () => {
    const invalid = await GET(new Request("http://localhost/api/episodes?page=1.5"), { params: Promise.resolve({ id: "99", seasonNumber: "1" }) });
    const outOfRange = await GET(new Request("http://localhost/api/episodes?page=3"), { params: Promise.resolve({ id: "99", seasonNumber: "1" }) });
    expect(invalid.status).toBe(400);
    expect(outOfRange.status).toBe(404);
  });

  it("returns not found without fetching a nonexistent season", async () => {
    const response = await GET(new Request("http://localhost/api/episodes?page=1"), { params: Promise.resolve({ id: "99", seasonNumber: "2" }) });
    expect(response.status).toBe(404);
    expect(mockTvSeason).not.toHaveBeenCalled();
  });

  it("maps TMDB failures to a safe gateway error", async () => {
    mockTvDetails.mockRejectedValue(new Error("token leaked here"));
    const response = await GET(new Request("http://localhost/api/episodes?page=1"), { params: Promise.resolve({ id: "99", seasonNumber: "1" }) });
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "Unable to load episodes from TMDB" });
  });
});
