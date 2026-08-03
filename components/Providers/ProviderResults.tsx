"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { QueryService } from "@/app/services/queryClient";
import MediaImage from "@/components/Common/MediaImage";
import PublicMediaGrid from "@/components/Seo/PublicMediaGrid";
import type { ContentKind, Genre, ProviderResponse } from "@/types/types";

const keys = ["kind", "genre", "sort", "ratingMin", "ratingMax", "runtimeMin", "runtimeMax", "yearMin", "yearMax", "page"] as const;
type State = Record<(typeof keys)[number], string>;
const defaults: State = { kind: "movie", genre: "", sort: "popularity.desc", ratingMin: "", ratingMax: "", runtimeMin: "", runtimeMax: "", yearMin: "", yearMax: "", page: "1" };

export default function ProviderResults({ providerId }: { providerId: string }) {
  const router = useRouter(); const pathname = usePathname(); const search = useSearchParams();
  const hasUrlState = keys.some((key) => search.has(key));
  const initial = useMemo(() => ({ ...defaults, ...Object.fromEntries(keys.map((key) => [key, search.get(key) || defaults[key]])) }), [search]);
  const [filters, setFilters] = useState<State>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!hasUrlState) {
      try { const saved = sessionStorage.getItem(`sceneit-provider-${providerId}`); if (saved) setFilters({ ...defaults, ...JSON.parse(saved), page: "1" }); } catch { /* Ignore unavailable storage. */ }
    }
    setReady(true);
  }, [hasUrlState, providerId]);

  useEffect(() => {
    if (!ready) return;
    const params = new URLSearchParams(); keys.forEach((key) => { if (filters[key] && filters[key] !== defaults[key]) params.set(key, filters[key]); });
    if (filters.kind === "tv") params.set("kind", "tv");
    router.replace(`${pathname}${params.size ? `?${params}` : ""}`, { scroll: false });
    try { sessionStorage.setItem(`sceneit-provider-${providerId}`, JSON.stringify(filters)); } catch { /* Ignore unavailable storage. */ }
  }, [filters, pathname, providerId, ready, router]);

  const kind = filters.kind === "tv" ? "tv" : "movie" as ContentKind;
  const providersQuery = useQuery<ProviderResponse>({ queryKey: ["providers", "US"], queryFn: () => QueryService.getProviders("US") });
  const genresQuery = useQuery<{ genres: Genre[] }>({ queryKey: ["genres", kind], queryFn: () => QueryService.getGenres(kind) });
  const selected = providersQuery.data?.results.find((provider) => String(provider.provider_id) === providerId);
  const datePrefix = kind === "movie" ? "primary_release_date" : "first_air_date";
  const results = useQuery({
    queryKey: ["provider-results", providerId, filters],
    queryFn: () => QueryService.discover(kind, { with_watch_providers: providerId, watch_region: "US", page: filters.page, sort_by: filters.sort, with_genres: filters.genre, "vote_average.gte": filters.ratingMin, "vote_average.lte": filters.ratingMax, "with_runtime.gte": filters.runtimeMin, "with_runtime.lte": filters.runtimeMax, [`${datePrefix}.gte`]: filters.yearMin ? `${filters.yearMin}-01-01` : undefined, [`${datePrefix}.lte`]: filters.yearMax ? `${filters.yearMax}-12-31` : undefined, "vote_count.gte": filters.sort === "vote_average.desc" ? 200 : 20 }),
    enabled: /^\d+$/.test(providerId),
  });
  const update = (key: keyof State, value: string, resetPage = true) => setFilters((current) => ({ ...current, [key]: value, ...(resetPage ? { page: "1" } : {}) }));
  const switchProvider = (id: string) => { const params = new URLSearchParams(); keys.forEach((key) => { if (key !== "page" && filters[key] && filters[key] !== defaults[key]) params.set(key, filters[key]); }); router.push(`/providers/${id}${params.size ? `?${params}` : ""}`); };
  const totalPages = Math.min(results.data?.total_pages || 1, 500);

  return <main className="mx-auto max-w-7xl space-y-7 px-4 py-10"><header className="flex items-center gap-4">{selected && <div className="relative h-16 w-16 overflow-hidden rounded-xl"><MediaImage path={selected.logo_path} kind="logo" size="w92" fallback="provider" fallbackLabel={selected.provider_name} fill sizes="64px" className="object-cover" alt={`${selected.provider_name} logo`} /></div>}<div><p className="text-sm font-medium text-orange-600">Available in the United States</p><h1 className="text-3xl font-bold dark:text-white">{selected?.provider_name || "Provider"} {kind === "movie" ? "Movies" : "TV Shows"}</h1></div></header>
    <section aria-label="Catalog filters" className="grid gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 md:grid-cols-2 lg:grid-cols-4">
      <Control label="Type"><select value={kind} onChange={(e) => setFilters((current) => { const nextKind = e.target.value; const sort = current.sort.replace(nextKind === "tv" ? "primary_release_date" : "first_air_date", nextKind === "tv" ? "first_air_date" : "primary_release_date"); return { ...current, kind: nextKind, sort, genre: "", page: "1" }; })}><option value="movie">Movies</option><option value="tv">TV shows</option></select></Control>
      <Control label="Provider"><select value={providerId} onChange={(e) => switchProvider(e.target.value)}>{(providersQuery.data?.results || []).map((provider) => <option key={provider.provider_id} value={provider.provider_id}>{provider.provider_name}</option>)}</select></Control>
      <Control label="Genre"><select value={filters.genre} onChange={(e) => update("genre", e.target.value)}><option value="">All genres</option>{(genresQuery.data?.genres || []).map((genre) => <option key={genre.id} value={genre.id}>{genre.name}</option>)}</select></Control>
      <Control label="Sort"><select value={filters.sort} onChange={(e) => update("sort", e.target.value)}><option value="popularity.desc">Popularity</option><option value="vote_average.desc">Rating</option><option value={kind === "movie" ? "primary_release_date.desc" : "first_air_date.desc"}>Newest</option><option value={kind === "movie" ? "primary_release_date.asc" : "first_air_date.asc"}>Oldest</option></select></Control>
      <Range label="Rating" min="0" max="10" step="0.1" left={filters.ratingMin} right={filters.ratingMax} onLeft={(v) => update("ratingMin", v)} onRight={(v) => update("ratingMax", v)} />
      <Range label="Runtime (minutes)" min="1" left={filters.runtimeMin} right={filters.runtimeMax} onLeft={(v) => update("runtimeMin", v)} onRight={(v) => update("runtimeMax", v)} />
      <Range label="Year" min="1900" max={String(new Date().getFullYear() + 5)} left={filters.yearMin} right={filters.yearMax} onLeft={(v) => update("yearMin", v)} onRight={(v) => update("yearMax", v)} />
    </section>
    {results.isLoading ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">{Array.from({ length: 10 }, (_, i) => <div key={i} className="aspect-[2/3] animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800" />)}</div> : results.error ? <p className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">{results.error instanceof Error ? results.error.message : "Catalog unavailable."}</p> : results.data?.results?.length ? <PublicMediaGrid items={results.data.results} kind={kind} /> : <p className="rounded-lg border border-dashed p-10 text-center text-gray-500">No titles match these filters.</p>}
    <nav aria-label="Pagination" className="flex items-center justify-between border-t pt-5 dark:border-gray-800"><button disabled={filters.page === "1" || results.isLoading} onClick={() => update("page", String(Math.max(1, Number(filters.page) - 1)), false)} className="flex items-center gap-2 rounded-lg border px-3 py-2 disabled:opacity-40"><ChevronLeft size={16} /> Previous</button><span className="text-sm text-gray-500">Page {filters.page} of {totalPages}</span><button disabled={Number(filters.page) >= totalPages || results.isLoading} onClick={() => update("page", String(Number(filters.page) + 1), false)} className="flex items-center gap-2 rounded-lg border px-3 py-2 disabled:opacity-40">Next <ChevronRight size={16} /></button></nav>
  </main>;
}

function Control({ label, children }: { label: string; children: React.ReactNode }) { return <label className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}<div className="mt-1 [&_select]:w-full [&_select]:rounded-md [&_select]:border [&_select]:bg-white [&_select]:px-3 [&_select]:py-2 [&_select]:text-gray-950 [&_option]:bg-white [&_option]:text-gray-950 dark:[&_select]:bg-gray-950 dark:[&_select]:text-white dark:[&_select]:[color-scheme:dark] dark:[&_option]:bg-gray-950 dark:[&_option]:text-white">{children}</div></label>; }
function Range({ label, left, right, onLeft, onRight, ...props }: { label: string; left: string; right: string; onLeft: (v: string) => void; onRight: (v: string) => void; min?: string; max?: string; step?: string }) { return <label className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}<span className="mt-1 grid grid-cols-2 gap-2"><input {...props} aria-label={`Minimum ${label}`} type="number" value={left} onChange={(e) => onLeft(e.target.value)} placeholder="Min" className="min-w-0 rounded-md border bg-transparent px-3 py-2" /><input {...props} aria-label={`Maximum ${label}`} type="number" value={right} onChange={(e) => onRight(e.target.value)} placeholder="Max" className="min-w-0 rounded-md border bg-transparent px-3 py-2" /></span></label>; }
