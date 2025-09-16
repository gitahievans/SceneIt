// ✅ Test that clicking the card calls router.push() (navigation).

describe("MovieCard", () => {
    it("calls router.push() when the card is clicked", () => {
        const mockPush = jest.fn();
        jest.mock('next/navigation', () => ({
            useRouter: () => ({
                push: mockPush,
            }),
        }));
    })
})