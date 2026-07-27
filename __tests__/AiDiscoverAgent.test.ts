import { APICallError, InvalidToolInputError, type LanguageModel } from "ai";
import { runSceneItDiscovery } from "@/lib/ai-discover/agent";
import { createToolExecutionState } from "@/lib/ai-discover/types";

const primary = { provider: "test", modelId: "primary" } as LanguageModel;
const fallback = { provider: "test", modelId: "fallback" } as LanguageModel;

function result(text: string, stepCount = 1, finishReason: "stop" | "tool-calls" = "stop") {
  return {
    text,
    steps: Array.from({ length: stepCount }, () => ({ finishReason })),
    response: { messages: [] },
  } as never;
}

function runtime(generate: jest.Mock) {
  return {
    getPrimaryModel: () => primary,
    getFallbackModel: () => fallback,
    generate,
  };
}

describe("SceneIt provider fallback", () => {
  it("falls back once after a primary network failure", async () => {
    const generate = jest.fn()
      .mockRejectedValueOnce(new TypeError("fetch failed"))
      .mockResolvedValueOnce(result("Here is a useful fallback answer."));

    const response = await runSceneItDiscovery({
      message: "Recommend a movie",
      messages: [],
      state: createToolExecutionState("US"),
      runtime: runtime(generate),
    });

    expect(response.answer).toContain("fallback");
    expect(generate).toHaveBeenCalledTimes(2);
    expect(generate.mock.calls[0][0]).toBe(primary);
    expect(generate.mock.calls[1][0]).toBe(fallback);
  });

  it("falls back for irreparable tool input", async () => {
    const malformed = new InvalidToolInputError({
      toolName: "searchMovies",
      toolInput: "{bad json",
      cause: new Error("invalid"),
    });
    const generate = jest.fn()
      .mockRejectedValueOnce(malformed)
      .mockResolvedValueOnce(result("I recovered using the fallback."));

    await runSceneItDiscovery({
      message: "Find Arrival",
      messages: [],
      state: createToolExecutionState("US"),
      runtime: runtime(generate),
    });

    expect(generate).toHaveBeenCalledTimes(2);
  });

  it.each([429, 503])("falls back for a primary HTTP %s response", async (statusCode) => {
    const providerError = new APICallError({
      message: "provider unavailable",
      url: "https://api.cloudflare.com/ai/v1/chat/completions",
      requestBodyValues: {},
      statusCode,
      isRetryable: true,
    });
    const generate = jest.fn()
      .mockRejectedValueOnce(providerError)
      .mockResolvedValueOnce(result("The fallback provider completed this request."));

    await runSceneItDiscovery({
      message: "Find something to watch",
      messages: [],
      state: createToolExecutionState("US"),
      runtime: runtime(generate),
    });

    expect(generate).toHaveBeenCalledTimes(2);
  });

  it("falls back after the eight-step budget is exhausted without a final answer", async () => {
    const generate = jest.fn()
      .mockResolvedValueOnce(result("", 8, "tool-calls"))
      .mockResolvedValueOnce(result("A concise answer after fallback."));

    await runSceneItDiscovery({
      message: "Research a current release",
      messages: [],
      state: createToolExecutionState("US"),
      runtime: runtime(generate),
    });

    expect(generate).toHaveBeenCalledTimes(2);
  });

  it("keeps the primary failure when fallback credentials are missing", async () => {
    const primaryFailure = new TypeError("fetch failed");
    const generate = jest.fn().mockRejectedValueOnce(primaryFailure);

    await expect(runSceneItDiscovery({
      message: "Find something to watch",
      messages: [],
      state: createToolExecutionState("US"),
      runtime: {
        getPrimaryModel: () => primary,
        getFallbackModel: () => {
          throw new Error("GEMINI_API_KEY is required for fallback");
        },
        generate,
      },
    })).rejects.toBe(primaryFailure);
  });

  it("does not fall back for a valid empty-result answer", async () => {
    const generate = jest.fn().mockResolvedValueOnce(
      result("I found no matching movies. Try relaxing the runtime constraint.")
    );

    const response = await runSceneItDiscovery({
      message: "Find an impossible match",
      messages: [],
      state: createToolExecutionState("US"),
      runtime: runtime(generate),
    });

    expect(response.movies).toEqual([]);
    expect(generate).toHaveBeenCalledTimes(1);
  });

  it("passes prior conversation context to the model", async () => {
    const generate = jest.fn().mockResolvedValueOnce(result("It is available on the requested provider."));
    await runSceneItDiscovery({
      message: "Which one is shorter?",
      messages: [
        { role: "user", content: "Compare Arrival and Contact" },
        { role: "assistant", content: "Both are thoughtful science-fiction films." },
      ],
      state: createToolExecutionState("US"),
      runtime: runtime(generate),
    });

    expect(generate.mock.calls[0][2]).toEqual(expect.arrayContaining([
      { role: "user", content: "Compare Arrival and Contact" },
      { role: "user", content: "Which one is shorter?" },
    ]));
  });

  it("creates follow-up suggestions from the current request and returned movies", async () => {
    const state = createToolExecutionState("US");
    state.movies.set(1, { id: 1, title: "Arrival" } as never);
    state.movies.set(2, { id: 2, title: "Contact" } as never);

    const response = await runSceneItDiscovery({
      message: "Find thoughtful first-contact science fiction",
      messages: [],
      state,
      runtime: runtime(jest.fn().mockResolvedValue(result("Arrival and Contact both fit your request."))),
    });

    expect(response.followUps).toEqual([
      "Which best matches my request: Arrival, Contact?",
      "Show me more movies like Arrival",
      "Where can I stream Arrival?",
    ]);
  });

  it("includes the current research topic in follow-up suggestions", async () => {
    const state = createToolExecutionState("US");
    state.activity.set("webSearch", 1);

    const response = await runSceneItDiscovery({
      message: "Latest casting news for Dune Messiah?",
      messages: [],
      state,
      runtime: runtime(jest.fn().mockResolvedValue(result("Here is the latest confirmed casting news."))),
    });

    expect(response.followUps).toEqual(expect.arrayContaining([
      "What is the latest confirmed update about: Latest casting news for Dune Messiah?",
      "Find a primary-source interview related to: Latest casting news for Dune Messiah",
    ]));
  });
});
