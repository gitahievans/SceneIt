import type { Metadata } from "next";
import Link from "next/link";
import PublicMediaGrid from "@/components/Seo/PublicMediaGrid";
import JsonLd from "@/utils/seo/jsonLd";
import { collections } from "@/utils/content/collections";
import { pageMetadata } from "@/utils/seo/metadata";
import { tmdbServer } from "@/utils/tmdb/server";
import { slugify } from "@/utils/seo/site";
import { providerAllowlist } from "@/utils/content/providers";
import CatalogHero from "@/components/Hero/CatalogHero";

export const metadata: Metadata = pageMetadata("Movies to Watch", "Explore trending, top-rated, mood-based, decade, and occasion movie recommendations selected by SceneIt.", "/movies");

export default async function MoviesPage() {
  const [data, genreData] = await Promise.all([tmdbServer.trending("movie").catch(() => ({ results: [] })), tmdbServer.genresFor("movie").catch(() => ({ genres: [] }))]);
  const movieCollections = collections.filter((item) => item.kind === "movie");
  return (
    <main className="mx-auto max-w-7xl space-y-10 px-4 py-8">
      <header className="max-w-3xl">
        <p className="text-sm font-medium text-orange-600">AI-assisted movie discovery</p>
        <h1 className="mt-2 text-4xl font-bold text-gray-950 dark:text-white">Movies to Watch</h1>
        <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">Find your next movie by mood, decade, occasion, genre, or streaming service. SceneIt combines practical filters with transparent editorial criteria.</p>
      </header>
      <CatalogHero kind="movie" trending={data.results} />
      <section>
        <h2 className="mb-5 text-2xl font-bold dark:text-white">Trending movies</h2>
        <PublicMediaGrid items={data.results.slice(0, 10)} kind="movie" />
      </section>
      <section>
        <h2 className="text-2xl font-bold dark:text-white">Browse curated movie lists</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {movieCollections.map((item) => <Link key={`${item.group}-${item.slug}`} href={`/movies/${item.group}/${item.slug}`} className="rounded-xl border border-gray-200 bg-white p-4 hover:border-orange-400 dark:border-gray-800 dark:bg-gray-900"><span className="font-semibold dark:text-white">{item.title}</span><p className="mt-1 text-sm text-gray-500">{item.description}</p></Link>)}
        </div>
      </section>
      <section><h2 className="text-2xl font-bold dark:text-white">Browse by genre</h2><div className="mt-4 flex flex-wrap gap-2">{genreData.genres.map((genre) => <Link key={genre.id} href={`/movies/genres/${slugify(genre.name)}`} className="rounded-full border border-gray-300 px-4 py-2 text-sm dark:border-gray-700 dark:text-white">{genre.name}</Link>)}</div></section>
      <section><h2 className="text-2xl font-bold dark:text-white">Browse by streaming service</h2><div className="mt-4 flex flex-wrap gap-2">{providerAllowlist.map((provider) => <Link key={provider.slug} href={`/movies/providers/${provider.slug}`} className="rounded-full border border-gray-300 px-4 py-2 text-sm dark:border-gray-700 dark:text-white">{provider.name}</Link>)}</div><p className="mt-3 text-sm text-gray-500">Streaming availability is shown for the United States.</p></section>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "CollectionPage", name: "Movies to Watch", description: metadata.description }} />
    </main>
  );
}
