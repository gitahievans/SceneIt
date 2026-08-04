/** @jest-environment node */

const mockGetUser = jest.fn();
const mockFrom = jest.fn();

jest.mock("@/utils/supabase/server", () => ({
  createClient: jest.fn(async () => ({ auth: { getUser: mockGetUser }, from: mockFrom })),
}));

import { POST } from "@/app/api/interactions/route";

function request(body: unknown) {
  return new Request("http://localhost/api/interactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function deleteBuilder(): { eq: jest.Mock; then: jest.Mock } {
  const builder: Record<string, jest.Mock> = {};
  builder.eq = jest.fn(() => builder);
  builder.then = jest.fn((resolve) => Promise.resolve(resolve({ error: null })));
  return builder as { eq: jest.Mock; then: jest.Mock };
}

describe("POST media interactions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: "session-user" } }, error: null });
  });

  it("returns 401 without an authenticated session", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    expect((await POST(request({ media_type: "movie", media_id: 1, action: "favorited" }))).status).toBe(401);
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it.each([
    { media_type: "person", media_id: 1, action: "favorited" },
    { media_type: "movie", media_id: 0, action: "favorited" },
    { media_type: "movie", media_id: 1, action: "watched" },
    { media_type: "movie", media_id: 1, action: "favorited", user_id: "attacker" },
  ])("returns 400 for invalid input %#", async (body) => {
    expect((await POST(request(body))).status).toBe(400);
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("uses an idempotent, media-aware upsert and the session user", async () => {
    const upsert = jest.fn().mockResolvedValue({ error: null });
    mockFrom.mockReturnValue({ upsert });

    for (const media_type of ["movie", "tv"] as const) {
      const response = await POST(request({ media_type, media_id: 42, action: "favorited" }));
      expect(response.status).toBe(200);
      expect(upsert).toHaveBeenLastCalledWith(
        { user_id: "session-user", media_type, media_id: 42, action: "favorited" },
        { onConflict: "user_id,media_type,media_id,action" }
      );
    }
  });

  it("makes repeated unfavorites safe deletes scoped to the session user and media key", async () => {
    const first = deleteBuilder();
    const second = deleteBuilder();
    mockFrom.mockReturnValueOnce({ delete: () => first }).mockReturnValueOnce({ delete: () => second });

    expect((await POST(request({ media_type: "tv", media_id: 42, action: "unfavorited" }))).status).toBe(200);
    expect((await POST(request({ media_type: "tv", media_id: 42, action: "unfavorited" }))).status).toBe(200);
    expect(first.eq.mock.calls).toEqual([
      ["user_id", "session-user"], ["media_type", "tv"], ["media_id", 42], ["action", "favorited"],
    ]);
  });
});
