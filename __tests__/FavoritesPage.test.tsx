import type { ReactElement } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const mockGetFavoriteReferences = jest.fn();
const mockGetMovieDetails = jest.fn();
const mockGetTvDetails = jest.fn();
const mockUpdateFavorite = jest.fn();
const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();
const mockToastDismiss = jest.fn();

jest.mock("@/utils/supabase/queries", () => ({
  getFavoriteReferences: (...args: unknown[]) => mockGetFavoriteReferences(...args),
}));
jest.mock("@/app/services/queryClient", () => ({
  QueryService: {
    getMovieDetails: (...args: unknown[]) => mockGetMovieDetails(...args),
    getTvDetails: (...args: unknown[]) => mockGetTvDetails(...args),
  },
}));
jest.mock("@/components/Common/MediaImage", () => ({
  __esModule: true,
  default: ({ alt }: { alt: string }) => <div role="img" aria-label={alt} />,
}));
jest.mock("@/utils/interactions", () => ({
  updateFavorite: (...args: unknown[]) => mockUpdateFavorite(...args),
}));
jest.mock("react-toastify", () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
    dismiss: (...args: unknown[]) => mockToastDismiss(...args),
  },
}));

import FavoritesPage from "@/app/favorites/page";

describe("FavoritesPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetFavoriteReferences.mockResolvedValue([
      { mediaType: "movie", mediaId: 7 },
      { mediaType: "tv", mediaId: 7 },
    ]);
    mockGetMovieDetails.mockResolvedValue({ id: 7, title: "Movie Seven", poster_path: "/movie.jpg" });
    mockGetTvDetails.mockResolvedValue({ id: 7, name: "Show Seven", poster_path: "/show.jpg" });
    mockUpdateFavorite.mockResolvedValue(undefined);
    mockToastSuccess.mockReturnValue("favorite-toast");
  });

  it("loads mixed media from the respective endpoints and creates canonical links", async () => {
    render(<FavoritesPage />);
    expect(await screen.findByText("Movie Seven")).toBeInTheDocument();
    expect(screen.getByText("Show Seven")).toBeInTheDocument();
    expect(mockGetMovieDetails).toHaveBeenCalledWith(7);
    expect(mockGetTvDetails).toHaveBeenCalledWith(7);
    expect(screen.getByRole("link", { name: /Movie Seven/ })).toHaveAttribute("href", "/movies/7-movie-seven");
    expect(screen.getByRole("link", { name: /Show Seven/ })).toHaveAttribute("href", "/tv/7-show-seven");
  });

  it("renders labelled remove controls outside the canonical links", async () => {
    render(<FavoritesPage />);
    const movieButton = await screen.findByRole("button", { name: "Remove Movie Seven from favorites" });
    const tvButton = screen.getByRole("button", { name: "Remove Show Seven from favorites" });

    expect(movieButton.closest("a")).toBeNull();
    expect(tvButton.closest("a")).toBeNull();
  });

  it("optimistically removes only the selected media type and sends unfavorited", async () => {
    render(<FavoritesPage />);
    fireEvent.click(await screen.findByRole("button", { name: "Remove Movie Seven from favorites" }));

    expect(screen.queryByText("Movie Seven")).not.toBeInTheDocument();
    expect(screen.getByText("Show Seven")).toBeInTheDocument();
    await waitFor(() => expect(mockUpdateFavorite).toHaveBeenCalledWith("movie", 7, "unfavorited"));
    expect(mockToastSuccess).toHaveBeenCalledTimes(1);
  });

  it("undoes a successful removal and restores the original ordering", async () => {
    render(<FavoritesPage />);
    fireEvent.click(await screen.findByRole("button", { name: "Remove Movie Seven from favorites" }));
    await waitFor(() => expect(mockToastSuccess).toHaveBeenCalledTimes(1));

    const undoNotification = mockToastSuccess.mock.calls[0][0] as ReactElement;
    render(undoNotification);
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));

    await waitFor(() => expect(mockUpdateFavorite).toHaveBeenLastCalledWith("movie", 7, "favorited"));
    expect(screen.getByText("Movie Seven")).toBeInTheDocument();
    expect(screen.getAllByRole("link").map((link) => link.getAttribute("href"))).toEqual([
      "/movies/7-movie-seven",
      "/tv/7-show-seven",
    ]);
  });

  it("restores a card when removal fails", async () => {
    mockUpdateFavorite.mockRejectedValueOnce(new Error("Request failed"));
    render(<FavoritesPage />);
    fireEvent.click(await screen.findByRole("button", { name: "Remove Show Seven from favorites" }));

    expect(screen.queryByText("Show Seven")).not.toBeInTheDocument();
    expect(await screen.findByText("Show Seven")).toBeInTheDocument();
    expect(mockToastError).toHaveBeenCalledWith("Could not remove Show Seven from favorites.");
  });

  it("removes an optimistically restored card again when Undo fails", async () => {
    mockUpdateFavorite
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error("Undo failed"));
    render(<FavoritesPage />);
    fireEvent.click(await screen.findByRole("button", { name: "Remove Movie Seven from favorites" }));
    await waitFor(() => expect(mockToastSuccess).toHaveBeenCalledTimes(1));

    render(mockToastSuccess.mock.calls[0][0] as ReactElement);
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));

    await waitFor(() => expect(screen.queryByText("Movie Seven")).not.toBeInTheDocument());
    expect(screen.getByText("Show Seven")).toBeInTheDocument();
    expect(mockToastError).toHaveBeenCalledWith("Could not restore Movie Seven to favorites.");
  });

  it("filters movie and TV favorites", async () => {
    render(<FavoritesPage />);
    await screen.findByText("Movie Seven");
    fireEvent.click(screen.getByRole("button", { name: "TV" }));
    expect(screen.queryByText("Movie Seven")).not.toBeInTheDocument();
    expect(screen.getByText("Show Seven")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Movies" }));
    expect(screen.getByText("Movie Seven")).toBeInTheDocument();
    expect(screen.queryByText("Show Seven")).not.toBeInTheDocument();
  });

  it("renders a media-neutral empty state", async () => {
    mockGetFavoriteReferences.mockResolvedValue([]);
    render(<FavoritesPage />);
    expect(await screen.findByText("No Favorites Yet")).toBeInTheDocument();
    expect(screen.getByText(/movie or TV show/i)).toBeInTheDocument();
  });

  it("updates filtered and overall empty states immediately", async () => {
    render(<FavoritesPage />);
    await screen.findByText("Movie Seven");
    fireEvent.click(screen.getByRole("button", { name: "Movies" }));
    fireEvent.click(screen.getByRole("button", { name: "Remove Movie Seven from favorites" }));
    expect(screen.getByText("No movie favorites yet.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "TV" }));
    fireEvent.click(screen.getByRole("button", { name: "Remove Show Seven from favorites" }));
    expect(screen.getByText("No Favorites Yet")).toBeInTheDocument();
  });
});
