import { notFound } from "next/navigation";
import type { Metadata } from "next";
import TaxonomyPage from "@/components/Seo/TaxonomyPage";
import { tmdbServer } from "@/utils/tmdb/server";
import { slugify } from "@/utils/seo/site";
import { pageMetadata } from "@/utils/seo/metadata";
type Props={params:Promise<{slug:string}>;searchParams:Promise<{page?:string}>};
async function genre(slug:string){const data=await tmdbServer.genresFor("tv").catch(()=>null);return data?.genres.find((item)=>slugify(item.name)===slug)}
const pn=(v?:string)=>Math.max(1,Math.min(500,Number(v)||1));
export async function generateMetadata({params,searchParams}:Props):Promise<Metadata>{const g=await genre((await params).slug);if(!g)return{robots:{index:false}};const p=pn((await searchParams).page);const path=`/tv/genres/${slugify(g.name)}${p>1?`?page=${p}`:""}`;return pageMetadata(`${g.name} TV Shows${p>1?` — Page ${p}`:""}`,`Discover popular and highly rated ${g.name.toLowerCase()} TV shows.`,path)}
export default async function Page({params,searchParams}:Props){const g=await genre((await params).slug);if(!g)notFound();const path=`/tv/genres/${slugify(g.name)}`;return <TaxonomyPage kind="tv" title={`${g.name} TV Shows`} description={`Discover popular and highly rated ${g.name.toLowerCase()} TV shows.`} filters={{with_genres:String(g.id),"vote_count.gte":"100"}} page={pn((await searchParams).page)} path={path}/>}
