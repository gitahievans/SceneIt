/** @jest-environment node */

const runSceneItDiscovery = jest.fn();
const getUser = jest.fn();
const rpc = jest.fn();

jest.mock("@/lib/ai-discover/agent", () => ({
  runSceneItDiscovery: (...args: unknown[]) => runSceneItDiscovery(...args),
}));

jest.mock("@/utils/supabase/server", () => ({
  createClient: jest.fn(async () => ({
    auth: { getUser },
    rpc,
  })),
}));

import { POST } from "@/app/api/ai/discover/route";

function localRequestContext() {
  const timeZone = "UTC";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const localDate = `${values.year}-${values.month}-${values.day}`;
  return { localDate, timeZone };
}

function makeRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/ai/discover", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, ...localRequestContext() }),
  });
}

describe("POST /api/ai/discover", () => {
  beforeEach(() => {
    runSceneItDiscovery.mockReset();
    getUser.mockReset();
    rpc.mockReset();
    getUser.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });
    rpc.mockResolvedValue({ data: [{ allowed: true, used: 1, remaining: 9, reset_date: "2026-07-29" }], error: null });
  });

  it("preserves the response contract with usage metadata and defaults to US", async () => {
    const payload = {
      mode: "discover",
      answer: "Try Arrival.",
      movies: [],
      sources: [],
      toolActivity: ["Searched TMDB"],
      followUps: ["Find another"],
      total_results: 0,
    };
    runSceneItDiscovery.mockResolvedValue(payload);
    const response = await POST(makeRequest({ message: "Recommend thoughtful science fiction" }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      ...payload,
      limit: 10,
      used: 1,
      remaining: 9,
      resetDate: "2026-07-29",
    });
    expect(rpc).toHaveBeenCalledWith("consume_ai_discover_daily_credit", {
      p_usage_date: localRequestContext().localDate,
      p_limit: 10,
    });
    expect(runSceneItDiscovery.mock.calls[0][0].state.region).toBe("US");
  });

  it("accepts contextual conversation messages", async () => {
    runSceneItDiscovery.mockResolvedValue({
      mode: "discover", answer: "The first is shorter.", movies: [], sources: [], toolActivity: [], followUps: [], total_results: 0,
    });
    await POST(makeRequest({
      message: "Which is shorter?",
      region: "gb",
      messages: [{ role: "assistant", content: "I suggested two films." }],
    }));

    expect(runSceneItDiscovery.mock.calls[0][0]).toEqual(expect.objectContaining({
      message: "Which is shorter?",
      messages: [{ role: "assistant", content: "I suggested two films." }],
    }));
    expect(runSceneItDiscovery.mock.calls[0][0].state.region).toBe("GB");
  });

  it("rejects invalid messages before invoking a model", async () => {
    const response = await POST(new Request("http://localhost/api/ai/discover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "", region: "USA", ...localRequestContext() }),
    }));

    expect(response.status).toBe(400);
    expect(rpc).not.toHaveBeenCalled();
    expect(runSceneItDiscovery).not.toHaveBeenCalled();
  });

  it("requires authentication before consuming usage", async () => {
    getUser.mockResolvedValue({ data: { user: null }, error: null });

    const response = await POST(makeRequest({ message: "Recommend a mystery" }));

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Authentication required" });
    expect(rpc).not.toHaveBeenCalled();
    expect(runSceneItDiscovery).not.toHaveBeenCalled();
  });

  it("blocks over-limit requests without invoking a model", async () => {
    rpc.mockResolvedValue({ data: [{ allowed: false, used: 10, remaining: 0, reset_date: "2026-07-29" }], error: null });

    const response = await POST(makeRequest({ message: "Find another thriller" }));

    expect(response.status).toBe(429);
    expect(await response.json()).toEqual({
      error: "Daily AI message limit reached",
      limit: 10,
      used: 10,
      remaining: 0,
      resetDate: "2026-07-29",
    });
    expect(runSceneItDiscovery).not.toHaveBeenCalled();
  });

  it("rejects stale local dates before consuming usage", async () => {
    const response = await POST(new Request("http://localhost/api/ai/discover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Recommend something",
        localDate: "2000-01-01",
        timeZone: "UTC",
      }),
    }));

    expect(response.status).toBe(400);
    expect(rpc).not.toHaveBeenCalled();
    expect(runSceneItDiscovery).not.toHaveBeenCalled();
  });
});
