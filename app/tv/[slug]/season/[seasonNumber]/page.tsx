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
};

export const revalidate = 21600;

export function generateStaticParams() {
  return [];
}

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

async function loadSeasonPage(slug: string, seasonValue: string): Promise<SeasonPageData | null> {
  const parsed = parseShowSlug(slug);
  const seasonNumber = parseSeasonNumber(seasonValue);
  if (!parsed || !parsePositiveInteger(parsed.id) || seasonNumber === null) return null;
  try {
    const show = await tmdbServer.tvDetails(parsed.id);
    const summary = findSeason(show, seasonNumber);
    if (!summary) return null;
    const season = await tmdbServer.tvSeason(parsed.id, seasonNumber);
    const episodePage = paginateSeason(season, 1);
    return episodePage ? { parsed, show, summary, season, episodePage } : null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, seasonNumber } = await params;
  const data = await loadSeasonPage(slug, seasonNumber);
  if (!data) return { title: "TV season not found", robots: { index: false } };
  const title = data.show.name || "TV Show";
  const path = tvSeasonPath(data.show.id, title, data.summary.season_number);
  return pageMetadata(
    `${title}: ${data.summary.name || `Season ${data.summary.season_number}`}`,
    data.summary.overview || `Browse ${title} ${data.summary.name || `Season ${data.summary.season_number}`} episodes, air dates, runtimes, and ratings.`,
    path
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

export default async function SeasonPage({ params }: Props) {
  const { slug, seasonNumber } = await params;
  const data = await loadSeasonPage(slug, seasonNumber);
  if (!data) notFound();
  const { parsed, show, summary, season, episodePage } = data;
  const showTitle = show.name || "TV Show";
  const canonicalPath = tvSeasonPath(show.id, showTitle, summary.season_number);
  if (parsed.suppliedSlug !== slugify(showTitle)) {
    permanentRedirect(canonicalPath);
  }
  const showPath = mediaPath("tv", show.id, showTitle);
  const seasonTitle = summary.name || `Season ${summary.season_number}`;

  return (
    <main className="min-h-screen bg-gray-950 text-white">
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
          <div><h2 className="text-3xl font-bold">Episodes</h2><p className="mt-1 text-gray-400">Showing the first {episodePage.episodes.length} of {episodePage.totalEpisodes}</p></div>
          <p className="text-sm text-gray-400">Showing {episodePage.episodes.length} at a time</p>
        </div>
        <SeasonEpisodes showId={show.id} seasonNumber={summary.season_number} seasonPath={canonicalPath} initialPage={1} totalPages={episodePage.totalPages} initialEpisodes={episodePage.episodes} />
      </section>
      <JsonLd data={seasonJsonLd(data)} />
    </main>
  );
}
