import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import AiDiscoverPage from "@/app/ai-discover/page";

jest.mock("@/components/Common/MovieGrid", () => {
  return function MovieGrid({ movies }: { movies: { id: number; title?: string }[] }) {
    return <div data-testid="movie-grid">{movies.map((movie) => movie.title || movie.id).join(", ")}</div>;
  };
});

jest.mock("@/components/ai-elements/message", () => ({
  MessageResponse: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const fetchMock = jest.fn();
const originalFetch = global.fetch;

function discoveryResponse(answer: string, used: number, remaining: number, followUps: string[] = []) {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      mode: "discover",
      answer,
      movies: [],
      sources: [],
      toolActivity: [],
      followUps,
      total_results: 0,
      limit: 10,
      used,
      remaining,
      resetDate: "2026-07-29",
    }),
  };
}

function retryableErrorResponse() {
  return {
    ok: false,
    status: 502,
    json: async () => ({
      error: "SceneIt AI could not complete that request. Please try again.",
      retryable: true,
    }),
  };
}

describe("AiDiscoverPage", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    window.sessionStorage.clear();
    Object.defineProperty(global, "fetch", { value: fetchMock, writable: true });
  });

  afterEach(() => {
    Object.defineProperty(global, "fetch", { value: originalFetch, writable: true });
  });

  it("renders multiple user and assistant turns with daily usage", async () => {
    fetchMock
      .mockResolvedValueOnce(discoveryResponse("Try Arrival.", 1, 9))
      .mockResolvedValueOnce(discoveryResponse("Try Contact next.", 2, 8));

    render(<AiDiscoverPage />);

    fireEvent.change(screen.getByPlaceholderText(/Ask for recommendations/i), {
      target: { value: "Recommend thoughtful sci-fi" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Ask/i }));

    expect(await screen.findByText("Try Arrival.")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/Ask for recommendations/i), {
      target: { value: "Another one" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Ask/i }));

    expect(await screen.findByText("Try Contact next.")).toBeInTheDocument();

    expect(screen.getByText("Recommend thoughtful sci-fi")).toBeInTheDocument();
    expect(screen.getByText("Another one")).toBeInTheDocument();
    expect(screen.getByText("Try Arrival.")).toBeInTheDocument();
    expect(screen.getByText("2 of 10 AI messages used today")).toBeInTheDocument();
  });

  it("disables send controls when the server reports no remaining sends", async () => {
    fetchMock.mockResolvedValueOnce(discoveryResponse("That was your last message.", 10, 0));

    render(<AiDiscoverPage />);

    const input = screen.getByPlaceholderText(/Ask for recommendations/i);
    fireEvent.change(input, { target: { value: "Use last send" } });
    fireEvent.click(screen.getByRole("button", { name: /Ask/i }));

    expect(await screen.findByText("10 of 10 AI messages used today")).toBeInTheDocument();

    expect(input).toBeDisabled();
    expect(screen.getByRole("button", { name: /Ask/i })).toBeDisabled();
    expect(screen.getByText(/Daily limit reached/i)).toBeInTheDocument();
  });

  it("sends follow-up prompts with prior transcript context", async () => {
    fetchMock
      .mockResolvedValueOnce(discoveryResponse("Try Heat.", 7, 3, ["Find a lighter option"]))
      .mockResolvedValueOnce(discoveryResponse("Try Sneakers.", 8, 2));

    render(<AiDiscoverPage />);

    fireEvent.change(screen.getByPlaceholderText(/Ask for recommendations/i), {
      target: { value: "Find a crime movie" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Ask/i }));

    expect(await screen.findByRole("button", { name: "Find a lighter option" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Find a lighter option" }));

    expect(await screen.findByText("Try Sneakers.")).toBeInTheDocument();

    const secondBody = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(secondBody.message).toBe("Find a lighter option");
    expect(secondBody.messages).toEqual([
      { role: "user", content: "Find a crime movie" },
      { role: "assistant", content: "Try Heat." },
    ]);
    expect(screen.getByText("8 of 10 AI messages used today")).toBeInTheDocument();
  });

  it("shows a retry action for retryable AI errors", async () => {
    fetchMock
      .mockResolvedValueOnce(retryableErrorResponse())
      .mockResolvedValueOnce(discoveryResponse("Try The Fugitive.", 2, 8));

    render(<AiDiscoverPage />);

    fireEvent.change(screen.getByPlaceholderText(/Ask for recommendations/i), {
      target: { value: "Find a chase thriller" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Ask/i }));

    expect(await screen.findByText("SceneIt AI could not complete that request. Please try again.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByText("Try The Fugitive.")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
