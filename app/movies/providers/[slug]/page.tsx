import { notFound } from "next/navigation";
import type { Metadata } from "next";
import TaxonomyPage from "@/components/Seo/TaxonomyPage";
import { providerAllowlist } from "@/utils/content/providers";
import { tmdbServer } from "@/utils/tmdb/server";
import { pageMetadata } from "@/utils/seo/metadata";
type Props={params:Promise<{slug:string}>;searchParams:Promise<{page?:string}>}; const pn=(v?:string)=>Math.max(1,Math.min(500,Number(v)||1));
async function provider(slug:string){const wanted=providerAllowlist.find((item)=>item.slug===slug);if(!wanted)return null;const data=await tmdbServer.movieProviders("US").catch(()=>null);return data?.results.find((item)=>item.provider_name===wanted.name||item.provider_name.startsWith(wanted.name))||null}
export async function generateMetadata({params,searchParams}:Props):Promise<Metadata>{const {slug}=await params;const p=pn((await searchParams).page);const item=providerAllowlist.find((x)=>x.slug===slug);return item?pageMetadata(`${item.name} Movies${p>1?` — Page ${p}`:""}`,`Find movies available to stream on ${item.name} in the United States.`,`/movies/providers/${slug}${p>1?`?page=${p}`:""}`):{robots:{index:false}}}
export default async function Page({params,searchParams}:Props){const {slug}=await params;const p=await provider(slug);if(!p)notFound();return <TaxonomyPage kind="movie" title={`Movies on ${p.provider_name}`} description={`Find movies available to stream on ${p.provider_name} in the United States.`} filters={{watch_region:"US",with_watch_providers:String(p.provider_id),with_watch_monetization_types:"flatrate"}} page={pn((await searchParams).page)} path={`/movies/providers/${slug}`}/>}
