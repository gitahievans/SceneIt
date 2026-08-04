import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import Breadcrumbs from "./Breadcrumbs";
import JsonLd from "@/utils/seo/jsonLd";
import PublicMediaGrid from "./PublicMediaGrid";
import type { ContentKind } from "@/utils/content/collections";
import { absoluteUrl, mediaPath, slugify } from "@/utils/seo/site";
import { tmdbServer } from "@/utils/tmdb/server";
import TrackEvent from "@/components/Analytics/TrackEvent";
import LikeButton from "@/components/DetailsPage/LikeButton";
import WatchButton from "@/components/Player/WatchButton";
import MediaImage from "@/components/Common/MediaImage";
import { tmdbImageUrl } from "@/utils/tmdb/image";
import SeasonEpisodes from "@/components/Tv/SeasonEpisodes";
import SeasonNavigation from "@/components/Tv/SeasonNavigation";
import type { TvSeasonSummary } from "@/types/types";
import { latestAiredRegularSeason, paginateSeason } from "@/utils/tmdb/tv";
import { tvSeasonPath } from "@/utils/seo/site";

export type MediaDetails = {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  tagline?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  last_air_date?: string;
  runtime?: number | null;
  episode_run_time?: number[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  seasons?: TvSeasonSummary[];
  last_episode_to_air?: { season_number: number; episode_number: number; air_date: string | null } | null;
  status?: string;
  vote_average?: number;
  vote_count?: number;
  genres?: Array<{ id: number; name: string }>;
  homepage?: string;
  recommendations?: { results?: any[] };
  similar?: { results?: any[] };
  "watch/providers"?: { results?: Record<string, { link?: string; flatrate?: Array<{ provider_id: number; provider_name: string }> }> };
};

export function parseMediaSlug(slug: string) {
  const match = slug.match(/^(\d+)(?:-(.*))?$/);
  return match ? { id: match[1], suppliedSlug: match[2] || "" } : null;
}

export async function getMedia(kind: ContentKind, slug: string) {
  const parsed = parseMediaSlug(slug);
  if (!parsed) return null;
  const details = await tmdbServer.details(kind, parsed.id).catch(() => null) as MediaDetails | null;
  return details ? { parsed, details } : null;
}

function runtime(details: MediaDetails) {
  const minutes = details.runtime || details.episode_run_time?.[0];
  if (!minutes) return null;
  return minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m`;
}

function synopsisParagraphs(overview?: string) {
  const synopsis = overview?.trim() || "A synopsis is not currently available.";
  return synopsis.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((sentence) => sentence.trim()).filter(Boolean) || [synopsis];
}

export default async function MediaDetailPage({ kind, slug }: { kind: ContentKind; slug: string }) {
  const result = await getMedia(kind, slug);
  if (!result) notFound();
  const { parsed, details } = result;
  const title = details.title || details.name || "Untitled";
  const canonical = mediaPath(kind, details.id, title);
  if (parsed.suppliedSlug !== slugify(title)) permanentRedirect(canonical);
  const date = details.release_date || details.first_air_date;
  const providers = details["watch/providers"]?.results?.US?.flatrate || [];
  const related = details.recommendations?.results?.length ? details.recommendations.results : details.similar?.results || [];
  const schemaType = kind === "movie" ? "Movie" : "TVSeries";
  const defaultSeasonSummary = kind === "tv" && details.seasons?.length
    ? latestAiredRegularSeason({ seasons: details.seasons, last_episode_to_air: details.last_episode_to_air })
    : null;
  const defaultSeason = defaultSeasonSummary
    ? await tmdbServer.tvSeason(String(details.id), defaultSeasonSummary.season_number).catch(() => null)
    : null;
  const defaultEpisodePage = defaultSeason ? paginateSeason(defaultSeason, 1) : null;
  const mobileSynopsis = synopsisParagraphs(details.overview);

  return (
    <main className="bg-gray-950 text-white">
      <TrackEvent name={`${kind}_detail_opened`} parameters={{ id: details.id, title }} />
      <article>
        <header className="relative overflow-hidden">
          <MediaImage path={details.backdrop_path} kind="backdrop" size="w1280" fallback="backdrop" fallbackLabel={`${title} backdrop unavailable`} alt="" fill loading="eager" fetchPriority="low" sizes="100vw" className="hidden object-cover opacity-25 md:block" />
          <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-[260px_1fr] md:py-20">
            <div className="relative hidden aspect-[2/3] overflow-hidden rounded-xl bg-gray-800 md:block">
              <MediaImage path={details.poster_path} kind="poster" size="w500" alt={`${title} poster`} fill priority fetchPriority="high" sizes="260px" className="object-cover" />
            </div>
            <div className="self-center">
              <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: kind === "movie" ? "Movies" : "TV", href: kind === "movie" ? "/movies" : "/tv" }, { name: title, href: canonical }]} />
              <h1 className="mt-5 text-4xl font-bold md:text-6xl">{title}</h1>
              {details.tagline && <p className="mt-3 text-xl italic text-gray-300">{details.tagline}</p>}
              <p className="mt-5 text-sm text-gray-300">{[date?.slice(0, 4), runtime(details), details.vote_average ? `TMDB ${details.vote_average.toFixed(1)}/10 (${(details.vote_count || 0).toLocaleString("en-US")} votes)` : null].filter(Boolean).join(" · ")}</p>
              {details.genres?.length ? <div className="mt-4 flex flex-wrap gap-2">{details.genres.map((genre) => <Link key={genre.id} href={`/${kind === "movie" ? "movies" : "tv"}/genres/${slugify(genre.name)}`} className="rounded-full border border-white/30 px-3 py-1 text-sm">{genre.name}</Link>)}</div> : null}
              <p className="mt-6 hidden max-w-3xl text-lg leading-8 text-gray-200 md:block">{details.overview || "A synopsis is not currently available."}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <LikeButton mediaType={kind} mediaId={details.id} />
                {kind === "movie" && <WatchButton movieId={details.id} />}
              </div>
              {providers.length > 0 && <div className="mt-6"><h2 className="font-semibold">Streaming in the United States</h2><ul className="mt-2 flex flex-wrap gap-2">{providers.map((provider) => <li key={provider.provider_id} className="rounded-full border border-white/20 px-3 py-1 text-sm text-gray-200">{provider.provider_name}</li>)}</ul><p className="mt-2 text-xs text-gray-400">Availability checked today; confirm pricing and access with the provider.</p></div>}
            </div>
          </div>
        </header>
        <section className="mx-auto max-w-7xl px-4 py-12">
          <h2 className="text-2xl font-bold">About {title}</h2>
          <div className="mt-4 space-y-3 text-gray-300 md:hidden">
            {mobileSynopsis.map((paragraph, index) => <p key={`${index}-${paragraph.slice(0, 24)}`} className="leading-7">{paragraph}</p>)}
          </div>
          <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div><dt className="text-sm text-gray-400">Status</dt><dd>{details.status || "Not listed"}</dd></div>
            <div><dt className="text-sm text-gray-400">TMDB rating</dt><dd>{details.vote_average ? `${details.vote_average.toFixed(1)}/10 from ${(details.vote_count || 0).toLocaleString("en-US")} votes` : "Not rated"}</dd></div>
            {kind === "tv" && <><div><dt className="text-sm text-gray-400">Seasons</dt><dd>{details.number_of_seasons || "Not listed"}</dd></div><div><dt className="text-sm text-gray-400">Episodes</dt><dd>{details.number_of_episodes || "Not listed"}</dd></div></>}
          </dl>
        </section>
        {kind === "tv" && details.seasons?.length ? (
          <section className="mx-auto max-w-7xl px-4 pb-16">
            <h2 className="text-3xl font-bold">Seasons and episodes</h2>
            <p className="mt-2 text-gray-400">The latest season with aired episodes is shown first. Specials are kept separate.</p>
            <div className="mt-6">
              <SeasonNavigation showId={details.id} showTitle={title} seasons={details.seasons} activeSeason={defaultSeasonSummary?.season_number ?? -1} />
            </div>
            {defaultSeasonSummary && defaultEpisodePage ? (
              <div className="mt-10">
                <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-orange-400">Latest aired season</p>
                    <h3 className="mt-1 text-2xl font-bold">{defaultSeasonSummary.name || `Season ${defaultSeasonSummary.season_number}`}</h3>
                  </div>
                  <Link href={tvSeasonPath(details.id, title, defaultSeasonSummary.season_number)} prefetch={false} className="font-semibold text-orange-400 hover:text-orange-300">View season page</Link>
                </div>
                <SeasonEpisodes
                  showId={details.id}
                  seasonNumber={defaultSeasonSummary.season_number}
                  seasonPath={tvSeasonPath(details.id, title, defaultSeasonSummary.season_number)}
                  initialPage={1}
                  totalPages={defaultEpisodePage.totalPages}
                  initialEpisodes={defaultEpisodePage.episodes}
                />
              </div>
            ) : null}
          </section>
        ) : null}
        {related.length > 0 && <section className="mx-auto max-w-7xl px-4 pb-16"><h2 className="mb-6 text-2xl font-bold">More like {title}</h2><PublicMediaGrid items={related.slice(0, 10)} kind={kind} /></section>}
      </article>
      <JsonLd data={{
        "@context": "https://schema.org", "@type": schemaType, name: title, description: details.overview,
        url: absoluteUrl(canonical), image: tmdbImageUrl(details.poster_path, "poster", "w500") || undefined,
        dateCreated: date || undefined,
        aggregateRating: details.vote_average && details.vote_count ? { "@type": "AggregateRating", ratingValue: details.vote_average, bestRating: 10, worstRating: 0, ratingCount: details.vote_count } : undefined,
      }} />
    </main>
  );
}
