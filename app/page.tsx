import Link from "next/link";
import PublicMediaGrid from "@/components/Seo/PublicMediaGrid";
import JsonLd from "@/utils/seo/jsonLd";
import { absoluteUrl, SITE_NAME } from "@/utils/seo/site";
import { tmdbServer } from "@/utils/tmdb/server";
import TrackEvent from "@/components/Analytics/TrackEvent";

export default async function HomePage() {
  const [movies, tv] = await Promise.all([
    tmdbServer.trending("movie").catch(() => ({ results: [] })),
    tmdbServer.trending("tv").catch(() => ({ results: [] })),
  ]);
  return (
    <main>
      <TrackEvent name="signup_completed" whenQuery={{ name: "signup", value: "pending" }} />
      <section className="mx-auto max-w-7xl px-4 py-16 text-center md:py-24">
        <p className="text-sm font-semibold uppercase tracking-widest text-orange-600">SceneIt AI</p>
        <h1 className="mx-auto mt-4 max-w-4xl text-5xl font-extrabold tracking-tight text-gray-950 dark:text-white md:text-7xl">AI movie recommendations for whatever tonight feels like</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-300">Tell SceneIt your mood, available time, streaming services, or who is watching. Get useful movie and TV picks with ratings and clear reasons.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3"><Link href="/ai-movie-recommendations" className="rounded-lg bg-orange-600 px-6 py-3 font-semibold text-white hover:bg-orange-700">Ask SceneIt AI</Link><Link href="/movies" className="rounded-lg border border-gray-300 px-6 py-3 font-semibold dark:border-gray-700 dark:text-white">Browse movies</Link></div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-10"><div className="mb-6 flex items-end justify-between"><div><p className="text-sm text-orange-600">Updated hourly</p><h2 className="text-3xl font-bold dark:text-white">Trending movies</h2></div><Link href="/movies/collections/trending" className="text-sm font-semibold text-orange-600">View all</Link></div><PublicMediaGrid items={movies.results.slice(0, 10)} kind="movie" /></section>
      <section className="mx-auto max-w-7xl px-4 py-10"><div className="mb-6 flex items-end justify-between"><div><p className="text-sm text-orange-600">Movies and TV</p><h2 className="text-3xl font-bold dark:text-white">Trending TV shows</h2></div><Link href="/tv/collections/trending" className="text-sm font-semibold text-orange-600">View all</Link></div><PublicMediaGrid items={tv.results.slice(0, 10)} kind="tv" /></section>
      <section className="mx-auto max-w-5xl px-4 py-16"><h2 className="text-3xl font-bold dark:text-white">Find something that fits the moment</h2><div className="mt-6 grid gap-4 md:grid-cols-3"><Link href="/movies/moods/feel-good" className="rounded-xl border p-5 dark:border-gray-700"><strong className="dark:text-white">Feel-good movies</strong><p className="mt-2 text-sm text-gray-500">Warm, upbeat picks with an optimistic payoff.</p></Link><Link href="/movies/collections/top-rated" className="rounded-xl border p-5 dark:border-gray-700"><strong className="dark:text-white">Top-rated movies</strong><p className="mt-2 text-sm text-gray-500">Audience favorites backed by substantial vote counts.</p></Link><Link href="/movies/occasions/date-night" className="rounded-xl border p-5 dark:border-gray-700"><strong className="dark:text-white">Date-night movies</strong><p className="mt-2 text-sm text-gray-500">Entertaining romantic picks for a shared evening.</p></Link></div></section>
      <JsonLd data={{ "@context": "https://schema.org", "@graph": [{ "@type": "WebSite", "@id": `${absoluteUrl("/")}#website`, name: SITE_NAME, url: absoluteUrl("/") }, { "@type": "Organization", "@id": `${absoluteUrl("/")}#organization`, name: "SceneIt", url: absoluteUrl("/"), logo: absoluteUrl("/assets/icon.png") }] }} />
    </main>
  );
}
