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
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("renders with initial state", async () => {
        // Mock the initial check call
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ exists: false })
        });

        render(<LikeButton movieId={1234} />);
        
        await waitFor(() => {
            expect(screen.getByText("Add to Favorites")).toBeInTheDocument();
        });
    });

    it("favorites a movie when clicked", async () => {
        // Mock the initial status check (not liked)
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ exists: false })
        });

        render(<LikeButton movieId={1234} />);

        // Wait for initial render to complete
        await waitFor(() => {
            expect(screen.getByText("Add to Favorites")).toBeInTheDocument();
        });

        // Now mock the favorite action for the click
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({})
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
    });

    it("unfavorites a movie when already liked", async () => {
        // Mock the initial status check (already liked)
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ exists: true })
        });

        render(<LikeButton movieId={1234} />);

        await waitFor(() => {
            expect(screen.getByText("Added to Favorites")).toBeInTheDocument();
        });

        // Now mock the unfavorite action for the click
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({})
        });

        // unfavorite when clicked
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
});