import type { Metadata } from "next";
import Image from "next/image";
import { pageMetadata } from "@/utils/seo/metadata";

export const metadata: Metadata = pageMetadata("About & Credits", "Learn how SceneIt selects recommendations and credits its movie and TV data sources.", "/about");
export default function AboutPage() {
  return <main className="mx-auto max-w-3xl space-y-10 px-4 py-12">
    <header><p className="text-sm font-medium text-orange-600">About SceneIt</p><h1 className="mt-2 text-4xl font-bold dark:text-white">Movie discovery with clearer choices</h1><p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">SceneIt helps people choose movies and TV shows by combining audience data, useful constraints, and AI-assisted discovery. Our curated pages explain their selection rules instead of presenting an unexplained catalog.</p></header>
    <section><h2 className="text-2xl font-bold dark:text-white">Methodology</h2><p className="mt-3 leading-7 text-gray-600 dark:text-gray-300">Recommendations use TMDB metadata such as genre, release date, runtime, popularity, audience rating, and vote count. Streaming pages use United States availability. Editorial lists are reviewed for relevance and usefulness; automated assistance may support research and drafting, but it does not replace review.</p></section>
    <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"><h2 className="text-2xl font-bold dark:text-white">Data credits</h2><a href="https://www.themoviedb.org" className="mt-4 inline-flex items-center gap-3" target="_blank" rel="noreferrer"><Image src="/tmdb-logo.svg" alt="TMDB" width={120} height={52}/><span className="sr-only">Visit TMDB</span></a><p className="mt-4 text-sm leading-6 text-gray-600 dark:text-gray-300">This product uses the TMDB API but is not endorsed or certified by TMDB.</p></section>
  </main>;
}
