import { fireEvent, render, screen, waitFor } from "@testing-library/react";

// mock a user
jest.mock("@/components/Providers", () => ({
    useAuth: jest.fn(() => ({ user: { id: 'tester' } }))
}));

import LikeButton from "@/components/LikeButton";

describe("LikeButton", () => {
    const mockFetch = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = mockFetch;

        mockFetch.mockImplementation((url) => {
            if (url.includes('/api/interactions/check')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({ exists: false })
                })
            }

            return Promise.resolve({
                ok: true,
                json: async () => ({})
            });
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("renders with initial state", async () => {
        render(<LikeButton movieId={1234} />);
        await waitFor(() => {
            expect(screen.getByText("Add to Favorites")).toBeInTheDocument();
        });
    })

    it("favorites a movie when clicked", async () => {
        mockFetch
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ exists: false })
            })
            // Mock the favorite action (successful)
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({})
            });

        render(<LikeButton movieId={1234} />);

        // Wait for initial render to complete
        await waitFor(() => {
            expect(screen.getByText("Add to Favorites")).toBeInTheDocument();
        });

        // Click the button
        const button = screen.getByText("Add to Favorites");
        fireEvent.click(button);

        // Should show processing state immediately
        expect(screen.getByText("Processing...")).toBeInTheDocument();

        // Wait for the UI to update to liked state
        await waitFor(() => {
            expect(screen.getByText("Added to Favorites")).toBeInTheDocument();
        }, { timeout: 3000 });

        // Verify the POST request was made with correct data
        expect(mockFetch).toHaveBeenCalledWith('/api/interactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: 'tester',
                movie_id: 1234,
                action: 'favorited'
            })
        });
    })


    it("unfavorites a movie when already liked", async () => {
        mockFetch.mockImplementation((url) => {
            if (url.includes('/api/interactions/check')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({ exists: true })
                });
            }
            return Promise.resolve({
                ok: true,
                json: async () => ({})
            });
        });

        render(<LikeButton movieId={1234} />);

        await waitFor(() => {
            expect(screen.getByText("Added to Favorites")).toBeInTheDocument();
        });

        // unfavorite when cliked
        fireEvent.click(screen.getByText("Added to Favorites"));

        // show processing
        expect(screen.getByText("Processing...")).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText("Add to Favorites")).toBeInTheDocument();
        });

        expect(mockFetch).toHaveBeenCalledWith('/api/interactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: 'tester',
                movie_id: 1234,
                action: 'unfavorited'
            })
        });
    });


})