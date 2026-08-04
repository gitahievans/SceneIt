import { fireEvent, render, screen } from "@testing-library/react";
import SeasonEpisodes from "@/components/Tv/SeasonEpisodes";
import type { TvEpisodeListItem } from "@/types/types";

jest.mock("@/components/Tv/EpisodeCard", () => ({
  __esModule: true,
  default: ({ episode }: { episode: TvEpisodeListItem }) => <article>{episode.name}</article>,
}));

function item(id: number, name = `Episode ${id}`): TvEpisodeListItem {
  return {
    id,
    seasonNumber: 1,
    episodeNumber: id,
    name,
    overview: "Summary",
    airDate: "2025-01-01",
    runtime: 24,
    rating: 8,
    voteCount: 10,
    stillPath: null,
    aired: true,
  };
}

describe("SeasonEpisodes", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    Object.defineProperty(global, "fetch", { value: originalFetch, writable: true });
  });

  it("keeps a real next-page link and appends the next distinct batch", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        seasonNumber: 1,
        page: 2,
        pageSize: 20,
        totalEpisodes: 3,
        totalPages: 2,
        episodes: [item(1), item(2, "The second episode")],
      }),
    });
    Object.defineProperty(global, "fetch", { value: fetchMock, writable: true });

    render(<SeasonEpisodes showId={99} seasonNumber={1} seasonPath="/tv/99-show/season/1" initialPage={1} totalPages={2} initialEpisodes={[item(1)]} />);

    const loadMore = screen.getByRole("link", { name: "Load more episodes" });
    expect(loadMore).toHaveAttribute("href", "/tv/99-show/season/1?page=2");
    fireEvent.click(loadMore);

    expect(await screen.findByText("The second episode")).toBeInTheDocument();
    expect(screen.getAllByText("Episode 1")).toHaveLength(1);
    expect(screen.getByRole("button", { name: "All episodes loaded" })).toBeDisabled();
    expect(fetchMock).toHaveBeenCalledWith("/api/tmdb/tv/99/seasons/1/episodes?page=2");
  });
});
