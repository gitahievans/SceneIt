import { isPrivateOrReservedHostname, normalizePublicHttpsUrl } from "@/lib/ai-discover/security";

describe("AI Discover page-read URL security", () => {
  it.each([
    "localhost",
    "api.internal",
    "10.0.0.1",
    "127.0.0.1",
    "169.254.169.254",
    "172.16.0.2",
    "192.168.1.1",
    "::1",
    "fc00::1",
    "2001:db8::1",
  ])("rejects private or reserved host %s", (host) => {
    expect(isPrivateOrReservedHostname(host)).toBe(true);
  });

  it("accepts and normalizes a public HTTPS URL", () => {
    expect(normalizePublicHttpsUrl("https://example.com/story#section")).toBe("https://example.com/story");
  });

  it.each(["http://example.com", "https://user:pass@example.com", "not a url"])(
    "rejects unsafe URL %s",
    (url) => expect(normalizePublicHttpsUrl(url)).toBeNull()
  );
});
