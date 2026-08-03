import { notFound } from "next/navigation";
import Breadcrumbs from "./Breadcrumbs";
import JsonLd from "@/utils/seo/jsonLd";
import PaginationLinks from "./PaginationLinks";
import PublicMediaGrid from "./PublicMediaGrid";
import { type CollectionDefinition } from "@/utils/content/collections";
import { tmdbServer } from "@/utils/tmdb/server";
import { absoluteUrl, mediaPath } from "@/utils/seo/site";
import { getMediaTitle, type PublicMediaItem } from "./PublicMediaCard";

export default async function CollectionPage({ collection, page, path }: {
  collection: CollectionDefinition;
  page: number;
  path: string;
}) {
  const params = new URLSearchParams({
    language: "en-US",
    page: String(page),
    sort_by: "popularity.desc",
    ...collection.filters,
  });
  if (collection.kind === "tv") {
    const from = params.get("primary_release_date.gte");
    const to = params.get("primary_release_date.lte");
    if (from) params.set("first_air_date.gte", from);
    if (to) params.set("first_air_date.lte", to);
    params.delete("primary_release_date.gte");
    params.delete("primary_release_date.lte");
  }
  if (collection.kind === "movie") params.set("include_adult", "false");
  const data = await tmdbServer.discover(collection.kind, params).catch(() => null);
  if (!data?.results?.length) notFound();
  const items = data.results as unknown as PublicMediaItem[];
  const noun = collection.kind === "movie" ? "Movies" : "TV";

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-8">
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: noun, href: collection.kind === "movie" ? "/movies" : "/tv" }, { name: collection.title, href: path }]} />
      <header>
        <p className="text-sm font-medium text-orange-600">Curated by SceneIt · United States</p>
        <h1 className="mt-2 text-4xl font-bold text-gray-950 dark:text-white">{collection.title}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-gray-600 dark:text-gray-300">{collection.introduction}</p>
        <p className="mt-3 text-sm text-gray-500">Updated {collection.updatedAt} · Ratings from TMDB</p>
      </header>
      <section aria-labelledby="selection-heading" className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <h2 id="selection-heading" className="font-semibold text-gray-950 dark:text-white">How we chose these titles</h2>
        <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">{collection.methodology}</p>
      </section>
      <PublicMediaGrid items={items} kind={collection.kind} explain />
      <PaginationLinks page={page} totalPages={Math.min(data.total_pages || 1, 500)} path={path} />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: collection.title,
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: (page - 1) * 20 + index + 1,
          url: absoluteUrl(mediaPath(collection.kind, item.id, getMediaTitle(item))),
          item: { "@type": collection.kind === "movie" ? "Movie" : "TVSeries", name: getMediaTitle(item) },
        })),
      }} />
    </main>
  );
}
