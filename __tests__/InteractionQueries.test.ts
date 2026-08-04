/** @jest-environment node */

const mockGetUser = jest.fn();
const mockFrom = jest.fn();

jest.mock("@/utils/supabase/server", () => ({
  createClient: jest.fn(async () => ({ auth: { getUser: mockGetUser }, from: mockFrom })),
}));

import { GET as checkInteraction } from "@/app/api/interactions/check/route";
import { GET as listFavorites } from "@/app/api/interactions/favorites/route";

function chain(result: unknown) {
  const builder: Record<string, jest.Mock> = {};
  for (const method of ["select", "eq", "order"]) builder[method] = jest.fn(() => builder);
  builder.maybeSingle = jest.fn().mockResolvedValue(result);
  builder.then = jest.fn((resolve) => Promise.resolve(resolve(result)));
  return builder;
}

describe("interaction queries", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: "session-user" } }, error: null });
  });

  it("checks status by session user, media type, media ID, and action", async () => {
    const builder = chain({ data: { id: 1 }, error: null });
    mockFrom.mockReturnValue(builder);
    const response = await checkInteraction(new Request("http://localhost/api/interactions/check?media_type=tv&media_id=9&action=favorited"));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ exists: true });
    expect(builder.eq.mock.calls).toEqual([
      ["user_id", "session-user"], ["media_type", "tv"], ["media_id", 9], ["action", "favorited"],
    ]);
  });

  it("rejects unauthenticated and malformed status checks", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });
    expect((await checkInteraction(new Request("http://localhost/api/interactions/check?media_type=movie&media_id=1&action=favorited"))).status).toBe(401);
    expect((await checkInteraction(new Request("http://localhost/api/interactions/check?media_type=movie&media_id=-1&action=favorited"))).status).toBe(400);
  });

  it("returns media-neutral favorite references for only the session user", async () => {
    const builder = chain({ data: [
      { media_type: "movie", media_id: 12 },
      { media_type: "tv", media_id: 12 },
    ], error: null });
    mockFrom.mockReturnValue(builder);
    const response = await listFavorites();
    expect(await response.json()).toEqual({ favorites: [
      { mediaType: "movie", mediaId: 12 },
      { mediaType: "tv", mediaId: 12 },
    ] });
    expect(builder.eq.mock.calls).toEqual([["user_id", "session-user"], ["action", "favorited"]]);
  });
});
