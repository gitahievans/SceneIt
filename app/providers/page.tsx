import type { Metadata } from "next";
import Link from "next/link";
import { providerAllowlist } from "@/utils/content/providers";
import { pageMetadata } from "@/utils/seo/metadata";
export const metadata:Metadata=pageMetadata("Streaming Providers","Browse movie and TV recommendations for major streaming services in the United States.","/providers");
export default function Page(){return <main className="mx-auto max-w-5xl px-4 py-12"><h1 className="text-4xl font-bold dark:text-white">Browse by streaming provider</h1><p className="mt-4 text-gray-600 dark:text-gray-300">Choose a service and browse titles reported as available in the United States. Always confirm availability with the provider.</p><div className="mt-8 grid gap-4 sm:grid-cols-2">{providerAllowlist.map((p)=><div key={p.slug} className="rounded-xl border p-5 dark:border-gray-700"><h2 className="font-bold dark:text-white">{p.name}</h2><div className="mt-3 flex gap-4 text-sm"><Link className="text-orange-600" href={`/movies/providers/${p.slug}`}>Movies</Link><Link className="text-orange-600" href={`/tv/providers/${p.slug}`}>TV shows</Link></div></div>)}</div></main>}
