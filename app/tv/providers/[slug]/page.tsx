import { notFound } from "next/navigation";
import type { Metadata } from "next";
import TaxonomyPage from "@/components/Seo/TaxonomyPage";
import { providerAllowlist } from "@/utils/content/providers";
import { fetchTmdb } from "@/utils/tmdb/server";
import type { ProviderResponse } from "@/types/types";
import { pageMetadata } from "@/utils/seo/metadata";
type Props={params:Promise<{slug:string}>;searchParams:Promise<{page?:string}>}; const pn=(v?:string)=>Math.max(1,Math.min(500,Number(v)||1));
async function provider(slug:string){const wanted=providerAllowlist.find((item)=>item.slug===slug);if(!wanted)return null;const data=await fetchTmdb<ProviderResponse>("/watch/providers/tv",new URLSearchParams({language:"en-US",watch_region:"US"}),60*60*6).catch(()=>null);return data?.results.find((item)=>item.provider_name===wanted.name||item.provider_name.startsWith(wanted.name))||null}
export async function generateMetadata({params,searchParams}:Props):Promise<Metadata>{const {slug}=await params;const p=pn((await searchParams).page);const item=providerAllowlist.find((x)=>x.slug===slug);return item?pageMetadata(`${item.name} TV Shows${p>1?` — Page ${p}`:""}`,`Find TV shows available to stream on ${item.name} in the United States.`,`/tv/providers/${slug}${p>1?`?page=${p}`:""}`):{robots:{index:false}}}
export default async function Page({params,searchParams}:Props){const {slug}=await params;const p=await provider(slug);if(!p)notFound();return <TaxonomyPage kind="tv" title={`TV Shows on ${p.provider_name}`} description={`Find TV shows available to stream on ${p.provider_name} in the United States.`} filters={{watch_region:"US",with_watch_providers:String(p.provider_id),with_watch_monetization_types:"flatrate"}} page={pn((await searchParams).page)} path={`/tv/providers/${slug}`}/>}
