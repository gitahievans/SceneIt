import { collections } from "@/utils/content/collections";
import { providerAllowlist } from "@/utils/content/providers";
import { absoluteUrl, mediaPath, slugify } from "./site";
import { tmdbServer } from "@/utils/tmdb/server";

type Entry = { loc: string; lastmod?: string; changefreq?: string; priority?: number };
const escapeXml = (value: string) => value.replace(/[<>&'"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[char]!));
export function urlset(entries: Entry[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.map((entry) => `<url><loc>${escapeXml(entry.loc)}</loc>${entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : ""}${entry.changefreq ? `<changefreq>${entry.changefreq}</changefreq>` : ""}${entry.priority ? `<priority>${entry.priority}</priority>` : ""}</url>`).join("")}</urlset>`;
}
export function staticSitemap() {
  const now = new Date().toISOString();
  return ["/", "/movies", "/tv", "/ai-movie-recommendations", "/about"].map((path) => ({ loc: absoluteUrl(path), lastmod: now, changefreq: "weekly", priority: path === "/" ? 1 : .8 }));
}
export async function collectionSitemap() {
  const entries = collections.map((item) => ({ loc: absoluteUrl(`/${item.kind === "movie" ? "movies" : "tv"}/${item.group}/${item.slug}`), lastmod: item.updatedAt, changefreq: "weekly", priority: .7 }));
  for (const kind of ["movies", "tv"]) for (const provider of providerAllowlist) entries.push({ loc: absoluteUrl(`/${kind}/providers/${provider.slug}`), lastmod: new Date().toISOString().slice(0, 10), changefreq: "weekly", priority: .7 });
  const [movieGenres, tvGenres] = await Promise.all([tmdbServer.genresFor("movie").catch(() => ({ genres: [] })), tmdbServer.genresFor("tv").catch(() => ({ genres: [] }))]);
  for (const genre of movieGenres.genres) entries.push({ loc: absoluteUrl(`/movies/genres/${slugify(genre.name)}`), lastmod: new Date().toISOString().slice(0, 10), changefreq: "monthly", priority: .6 });
  for (const genre of tvGenres.genres) entries.push({ loc: absoluteUrl(`/tv/genres/${slugify(genre.name)}`), lastmod: new Date().toISOString().slice(0, 10), changefreq: "monthly", priority: .6 });
  return entries;
}
export async function titleSitemap() {
  const [movies, tv] = await Promise.all([tmdbServer.trending("movie").catch(() => ({ results: [] })), tmdbServer.trending("tv").catch(() => ({ results: [] }))]);
  const now = new Date().toISOString();
  return [
    ...movies.results.map((item: any) => ({ loc: absoluteUrl(mediaPath("movie", item.id, item.title)), lastmod: now, changefreq: "weekly", priority: .7 })),
    ...tv.results.map((item: any) => ({ loc: absoluteUrl(mediaPath("tv", item.id, item.name)), lastmod: now, changefreq: "weekly", priority: .7 })),
  ];
}
