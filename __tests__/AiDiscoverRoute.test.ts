/** @jest-environment node */

const runSceneItDiscovery = jest.fn();

jest.mock("@/lib/ai-discover/agent", () => ({
  runSceneItDiscovery: (...args: unknown[]) => runSceneItDiscovery(...args),
}));

import { POST } from "@/app/api/ai/discover/route";

describe("POST /api/ai/discover", () => {
  beforeEach(() => runSceneItDiscovery.mockReset());

  it("preserves the public response contract and defaults to US", async () => {
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
    const response = await POST(new Request("http://localhost/api/ai/discover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Recommend thoughtful science fiction" }),
    }));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(payload);
    expect(runSceneItDiscovery.mock.calls[0][0].state.region).toBe("US");
  });

  it("accepts contextual conversation messages", async () => {
    runSceneItDiscovery.mockResolvedValue({
      mode: "discover", answer: "The first is shorter.", movies: [], sources: [], toolActivity: [], followUps: [], total_results: 0,
    });
    await POST(new Request("http://localhost/api/ai/discover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Which is shorter?",
        region: "gb",
        messages: [{ role: "assistant", content: "I suggested two films." }],
      }),
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
      body: JSON.stringify({ message: "", region: "USA" }),
    }));

    expect(response.status).toBe(400);
    expect(runSceneItDiscovery).not.toHaveBeenCalled();
  });
});
