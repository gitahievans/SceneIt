import type { Metadata } from "next";
import Link from "next/link";
import PublicMediaGrid from "@/components/Seo/PublicMediaGrid";
import { collections } from "@/utils/content/collections";
import { pageMetadata } from "@/utils/seo/metadata";
import { tmdbServer } from "@/utils/tmdb/server";
import { slugify } from "@/utils/seo/site";
import { providerAllowlist } from "@/utils/content/providers";
import CatalogHero from "@/components/Hero/CatalogHero";

export const metadata: Metadata = pageMetadata("TV Shows to Watch", "Explore trending, top-rated, mood-based, decade, and occasion TV recommendations selected by SceneIt.", "/tv");

export default async function TvPage() {
  const [data, genreData] = await Promise.all([tmdbServer.trending("tv").catch(() => ({ results: [] })), tmdbServer.genresFor("tv").catch(() => ({ genres: [] }))]);
  const tvCollections = collections.filter((item) => item.kind === "tv");
  return (
    <main className="mx-auto max-w-7xl space-y-10 px-4 py-8">
      <header className="max-w-3xl"><p className="text-sm font-medium text-orange-600">TV discovery</p><h1 className="mt-2 text-4xl font-bold text-gray-950 dark:text-white">TV Shows to Watch</h1><p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">Browse transparent, audience-informed TV picks by mood, decade, and viewing occasion.</p></header>
      <CatalogHero kind="tv" trending={data.results} />
      <section><h2 className="mb-5 text-2xl font-bold dark:text-white">Trending TV shows</h2><PublicMediaGrid items={data.results.slice(0, 10)} kind="tv" /></section>
      <section><h2 className="text-2xl font-bold dark:text-white">Browse curated TV lists</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{tvCollections.map((item) => <Link key={`${item.group}-${item.slug}`} href={`/tv/${item.group}/${item.slug}`} className="rounded-xl border border-gray-200 bg-white p-4 hover:border-orange-400 dark:border-gray-800 dark:bg-gray-900"><span className="font-semibold dark:text-white">{item.title}</span><p className="mt-1 text-sm text-gray-500">{item.description}</p></Link>)}</div></section>
      <section><h2 className="text-2xl font-bold dark:text-white">Browse TV genres</h2><div className="mt-4 flex flex-wrap gap-2">{genreData.genres.map((genre) => <Link key={genre.id} href={`/tv/genres/${slugify(genre.name)}`} className="rounded-full border border-gray-300 px-4 py-2 text-sm dark:border-gray-700 dark:text-white">{genre.name}</Link>)}</div></section>
      <section><h2 className="text-2xl font-bold dark:text-white">Browse by streaming service</h2><div className="mt-4 flex flex-wrap gap-2">{providerAllowlist.map((provider) => <Link key={provider.slug} href={`/tv/providers/${provider.slug}`} className="rounded-full border border-gray-300 px-4 py-2 text-sm dark:border-gray-700 dark:text-white">{provider.name}</Link>)}</div><p className="mt-3 text-sm text-gray-500">Streaming availability is shown for the United States.</p></section>
    </main>
  );
}
