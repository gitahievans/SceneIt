import { createSceneItTools } from "@/lib/ai-discover/tools";
import {
  MAX_PAGE_MARKDOWN_CHARS,
  MAX_PAGE_READS,
  MAX_SERPER_SEARCHES,
  SERPER_RESULTS_PER_SEARCH,
  createToolExecutionState,
} from "@/lib/ai-discover/types";

type ExecutableTool = { execute: (input: Record<string, unknown>) => Promise<Record<string, unknown>> };

function executable(tool: unknown) {
  return tool as ExecutableTool;
}

describe("AI Discover web tool limits", () => {
  const originalFetch = global.fetch;
  const originalEnv = { ...process.env };

  afterEach(() => {
    global.fetch = originalFetch;
    process.env = { ...originalEnv };
    jest.restoreAllMocks();
  });

  it("returns at most five results and counts parallel searches individually", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        organic: Array.from({ length: 8 }, (_, index) => ({
          title: `Result ${index}`,
          link: `https://example.com/${index}`,
          snippet: "Snippet",
        })),
      }),
    }) as jest.Mock;
    process.env.SERPER_API_KEY = "test";
    const state = createToolExecutionState("US");
    const search = executable(createSceneItTools(state).searchWeb);

    const responses = await Promise.all(
      Array.from({ length: MAX_SERPER_SEARCHES + 1 }, (_, index) => search.execute({ query: `query ${index}` }))
    );

    expect((responses[0].results as unknown[])).toHaveLength(SERPER_RESULTS_PER_SEARCH);
    expect(responses.at(-1)?.error).toContain("Search limit reached");
    expect(global.fetch).toHaveBeenCalledTimes(MAX_SERPER_SEARCHES);
  });

  it("only reads a Serper-returned public HTTPS URL and truncates oversized Markdown", async () => {
    process.env.CLOUDFLARE_ACCOUNT_ID = "account";
    process.env.CLOUDFLARE_API_TOKEN = "token";
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ result: "x".repeat(MAX_PAGE_MARKDOWN_CHARS + 500) }),
    }) as jest.Mock;
    const state = createToolExecutionState("US");
    state.searchResults.set("https://example.com/story", {
      title: "Story",
      url: "https://example.com/story",
    });
    const read = executable(createSceneItTools(state).readWebPage);

    expect((await read.execute({ url: "http://example.com/story" })).error).toContain("public HTTPS");
    expect((await read.execute({ url: "https://127.0.0.1/story" })).error).toContain("public HTTPS");
    expect((await read.execute({ url: "https://other.example/story" })).error).toContain("not returned");

    const page = await read.execute({ url: "https://example.com/story" });
    expect(page.markdown).toHaveLength(MAX_PAGE_MARKDOWN_CHARS);
    expect(page.truncated).toBe(true);
  });

  it("enforces the three-page-read limit", async () => {
    process.env.CLOUDFLARE_ACCOUNT_ID = "account";
    process.env.CLOUDFLARE_API_TOKEN = "token";
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ result: "page" }) }) as jest.Mock;
    const state = createToolExecutionState("US");
    for (let index = 0; index <= MAX_PAGE_READS; index += 1) {
      state.searchResults.set(`https://example.com/${index}`, { title: `${index}`, url: `https://example.com/${index}` });
    }
    const read = executable(createSceneItTools(state).readWebPage);
    for (let index = 0; index < MAX_PAGE_READS; index += 1) {
      expect((await read.execute({ url: `https://example.com/${index}` })).markdown).toBe("page");
    }
    expect((await read.execute({ url: `https://example.com/${MAX_PAGE_READS}` })).error).toContain("Page-read limit reached");
    expect(global.fetch).toHaveBeenCalledTimes(MAX_PAGE_READS);
  });
});
