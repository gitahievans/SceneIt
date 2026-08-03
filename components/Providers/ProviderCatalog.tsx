"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useState } from "react";
import MediaImage from "@/components/Common/MediaImage";
import { providerAllowlist } from "@/utils/content/providers";
import type { Provider } from "@/types/types";

function Card({ provider }: { provider: Provider }) {
  return <Link href={`/providers/${provider.provider_id}`} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 transition hover:border-orange-400 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"><div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg"><MediaImage path={provider.logo_path} kind="logo" size="w92" fallback="provider" fallbackLabel={provider.provider_name} fill sizes="48px" className="object-cover" alt={`${provider.provider_name} logo`} /></div><span className="text-sm font-semibold text-gray-950 dark:text-white">{provider.provider_name}</span></Link>;
}

export default function ProviderCatalog({ providers }: { providers: Provider[] }) {
  const [query, setQuery] = useState("");
  const featured = providerAllowlist.map((entry) => providers.find((provider) => provider.provider_name === entry.name || provider.provider_name.startsWith(entry.name))).filter(Boolean) as Provider[];
  const filtered = providers.filter((provider) => provider.provider_name.toLowerCase().includes(query.trim().toLowerCase()));
  return <main className="mx-auto max-w-7xl space-y-10 px-4 py-10"><header><p className="text-sm font-medium text-orange-600">Streaming providers</p><h1 className="mt-1 text-4xl font-bold text-gray-950 dark:text-white">Watch by provider</h1><p className="mt-3 max-w-2xl text-gray-600 dark:text-gray-300">Browse movie and TV catalogs reported as available in the United States. Confirm current access and pricing with the provider.</p></header>{featured.length > 0 && <section><h2 className="mb-4 text-2xl font-bold dark:text-white">Featured services</h2><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{featured.map((provider) => <Card key={provider.provider_id} provider={provider} />)}</div></section>}<section><h2 className="text-2xl font-bold dark:text-white">All providers</h2><label className="relative mt-4 block max-w-xl"><span className="sr-only">Search providers</span><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search every provider" className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-4 dark:border-gray-700 dark:bg-gray-900 dark:text-white" /></label><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{filtered.map((provider) => <Card key={provider.provider_id} provider={provider} />)}</div>{filtered.length === 0 && <p className="mt-8 rounded-lg border border-dashed p-8 text-center text-gray-500">No providers match that search.</p>}</section></main>;
}
