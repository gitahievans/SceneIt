import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import Breadcrumbs from "@/components/Seo/Breadcrumbs";
import JsonLd from "@/utils/seo/jsonLd";
import SeasonEpisodes from "@/components/Tv/SeasonEpisodes";
import SeasonNavigation from "@/components/Tv/SeasonNavigation";
import MediaImage from "@/components/Common/MediaImage";
import type { TvDetails, TvEpisodePage, TvSeasonDetails, TvSeasonSummary } from "@/types/types";
import { pageMetadata } from "@/utils/seo/metadata";
import { absoluteUrl, mediaPath, slugify, tvSeasonPath } from "@/utils/seo/site";
import { tmdbImageUrl } from "@/utils/tmdb/image";
import { tmdbServer } from "@/utils/tmdb/server";
import { findSeason, paginateSeason, parsePositiveInteger, parseSeasonNumber } from "@/utils/tmdb/tv";

type Props = {
  params: Promise<{ slug: string; seasonNumber: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
};

type SeasonPageData = {
  parsed: { id: string; suppliedSlug: string };
  show: TvDetails;
  summary: TvSeasonSummary;
  season: TvSeasonDetails;
  episodePage: TvEpisodePage;
};

function parseShowSlug(slug: string) {
  const match = slug.match(/^(\d+)(?:-(.*))?$/);
  return match ? { id: match[1], suppliedSlug: match[2] || "" } : null;
}

function requestedPage(value: string | string[] | undefined) {
  if (Array.isArray(value)) return null;
  return parsePositiveInteger(value || "1");
}

async function loadSeasonPage(slug: string, seasonValue: string, page: number): Promise<SeasonPageData | null> {
  const parsed = parseShowSlug(slug);
  const seasonNumber = parseSeasonNumber(seasonValue);
  if (!parsed || !parsePositiveInteger(parsed.id) || seasonNumber === null) return null;
  try {
    const show = await tmdbServer.tvDetails(parsed.id);
    const summary = findSeason(show, seasonNumber);
    if (!summary) return null;
    const season = await tmdbServer.tvSeason(parsed.id, seasonNumber);
    const episodePage = paginateSeason(season, page);
    return episodePage ? { parsed, show, summary, season, episodePage } : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ slug, seasonNumber }, query] = await Promise.all([params, searchParams]);
  const page = requestedPage(query.page);
  if (!page) return { title: "TV season not found", robots: { index: false } };
  const data = await loadSeasonPage(slug, seasonNumber, page);
  if (!data) return { title: "TV season not found", robots: { index: false } };
  const title = data.show.name || "TV Show";
  const path = tvSeasonPath(data.show.id, title, data.summary.season_number);
  const canonical = page > 1 ? `${path}?page=${page}` : path;
  const pageSuffix = page > 1 ? ` — Episodes ${((page - 1) * 20) + 1}–${Math.min(page * 20, data.episodePage.totalEpisodes)}` : "";
  return pageMetadata(
    `${title}: ${data.summary.name || `Season ${data.summary.season_number}`}${pageSuffix}`,
    data.summary.overview || `Browse ${title} ${data.summary.name || `Season ${data.summary.season_number}`} episodes, air dates, runtimes, and ratings.`,
    canonical
  );
}

function seasonJsonLd(data: SeasonPageData) {
  const { show, summary, season, episodePage } = data;
  const path = tvSeasonPath(show.id, show.name, summary.season_number);
  const firstPosition = (episodePage.page - 1) * episodePage.pageSize;
  const seasonImage = tmdbImageUrl(season.poster_path || summary.poster_path, "poster", "w500") || undefined;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TVSeason",
        "@id": absoluteUrl(`${path}#season`),
        name: summary.name || `Season ${summary.season_number}`,
        seasonNumber: summary.season_number,
        numberOfEpisodes: episodePage.totalEpisodes,
        description: season.overview || summary.overview || undefined,
        startDate: season.air_date || summary.air_date || undefined,
        image: seasonImage,
        url: absoluteUrl(path),
        partOfSeries: { "@type": "TVSeries", name: show.name, url: absoluteUrl(mediaPath("tv", show.id, show.name)) },
      },
      {
        "@type": "ItemList",
        name: `${show.name} ${summary.name || `Season ${summary.season_number}`} episodes`,
        numberOfItems: episodePage.episodes.length,
        itemListElement: episodePage.episodes.map((episode, index) => ({
          "@type": "ListItem",
          position: firstPosition + index + 1,
          item: {
            "@type": "TVEpisode",
            name: episode.name,
            episodeNumber: episode.episodeNumber,
            datePublished: episode.airDate || undefined,
            description: episode.overview,
            image: tmdbImageUrl(episode.stillPath, "backdrop", "w780") || undefined,
            partOfSeason: { "@id": absoluteUrl(`${path}#season`) },
          },
        })),
      },
    ],
  };
}

export default async function SeasonPage({ params, searchParams }: Props) {
  const [{ slug, seasonNumber }, query] = await Promise.all([params, searchParams]);
  const page = requestedPage(query.page);
  if (!page) notFound();
  const data = await loadSeasonPage(slug, seasonNumber, page);
  if (!data) notFound();
  const { parsed, show, summary, season, episodePage } = data;
  const showTitle = show.name || "TV Show";
  const canonicalPath = tvSeasonPath(show.id, showTitle, summary.season_number);
  if (parsed.suppliedSlug !== slugify(showTitle)) {
    permanentRedirect(page > 1 ? `${canonicalPath}?page=${page}` : canonicalPath);
  }
  const showPath = mediaPath("tv", show.id, showTitle);
  const seasonTitle = summary.name || `Season ${summary.season_number}`;

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {page > 1 && <link rel="prev" href={absoluteUrl(page === 2 ? canonicalPath : `${canonicalPath}?page=${page - 1}`)} />}
      {page < episodePage.totalPages && <link rel="next" href={absoluteUrl(`${canonicalPath}?page=${page + 1}`)} />}
      <header className="border-b border-white/10 bg-gradient-to-b from-indigo-950/60 to-gray-950">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[180px_1fr]">
          <div className="relative hidden aspect-[2/3] overflow-hidden rounded-xl bg-gray-900 md:block">
            <MediaImage path={season.poster_path || summary.poster_path || show.poster_path} kind="poster" size="w342" alt={`${showTitle} ${seasonTitle} poster`} fill priority fetchPriority="high" sizes="180px" className="object-cover" />
          </div>
          <div className="self-center">
            <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "TV", href: "/tv" }, { name: showTitle, href: showPath }, { name: seasonTitle, href: canonicalPath }]} />
            <p className="mt-5 text-sm font-semibold uppercase tracking-wider text-orange-400">{showTitle}</p>
            <h1 className="mt-2 text-4xl font-bold md:text-5xl">{seasonTitle}</h1>
            <p className="mt-4 max-w-3xl leading-7 text-gray-300">{season.overview || summary.overview || "A season summary is not currently available."}</p>
            <p className="mt-4 text-sm text-gray-400">{episodePage.totalEpisodes} episode{episodePage.totalEpisodes === 1 ? "" : "s"}{summary.air_date ? ` · First aired ${summary.air_date}` : ""}</p>
          </div>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-4 py-10">
        <h2 className="mb-5 text-2xl font-bold">Choose a season</h2>
        <SeasonNavigation showId={show.id} showTitle={showTitle} seasons={show.seasons} activeSeason={summary.season_number} />
      </section>
      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div><h2 className="text-3xl font-bold">Episodes</h2><p className="mt-1 text-gray-400">Page {page} of {episodePage.totalPages}</p></div>
          <p className="text-sm text-gray-400">Showing {episodePage.episodes.length} at a time</p>
        </div>
        <SeasonEpisodes showId={show.id} seasonNumber={summary.season_number} seasonPath={canonicalPath} initialPage={page} totalPages={episodePage.totalPages} initialEpisodes={episodePage.episodes} />
      </section>
      <JsonLd data={seasonJsonLd(data)} />
    </main>
  );
}
