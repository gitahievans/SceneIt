import { tmdbImageUrl } from "@/utils/tmdb/image";

describe("tmdbImageUrl", () => {
  it("builds validated TMDB image URLs", () => {
    expect(tmdbImageUrl("/poster.jpg", "poster", "w500")).toBe("https://image.tmdb.org/t/p/w500/poster.jpg");
  });

  it.each([null, undefined, "", "null", "undefined", "poster.jpg", "/../secret.jpg", "//bad.jpg"])("rejects malformed path %p", (path) => {
    expect(tmdbImageUrl(path, "poster", "w500")).toBeNull();
  });
});
