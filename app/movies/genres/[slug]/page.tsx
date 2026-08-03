import { notFound } from "next/navigation";
import type { Metadata } from "next";
import TaxonomyPage from "@/components/Seo/TaxonomyPage";
import { tmdbServer } from "@/utils/tmdb/server";
import { slugify } from "@/utils/seo/site";
import { pageMetadata } from "@/utils/seo/metadata";
type Props={params:Promise<{slug:string}>;searchParams:Promise<{page?:string}>};
async function genre(slug:string){const data=await tmdbServer.genresFor("movie").catch(()=>null);return data?.genres.find((item)=>slugify(item.name)===slug)}
const pn=(v?:string)=>Math.max(1,Math.min(500,Number(v)||1));
export async function generateMetadata({params,searchParams}:Props):Promise<Metadata>{const g=await genre((await params).slug);if(!g)return{robots:{index:false}};const p=pn((await searchParams).page);const path=`/movies/genres/${slugify(g.name)}${p>1?`?page=${p}`:""}`;return pageMetadata(`${g.name} Movies${p>1?` — Page ${p}`:""}`,`Discover popular and highly rated ${g.name.toLowerCase()} movies.`,path)}
export default async function Page({params,searchParams}:Props){const g=await genre((await params).slug);if(!g)notFound();const path=`/movies/genres/${slugify(g.name)}`;return <TaxonomyPage kind="movie" title={`${g.name} Movies`} description={`Discover popular and highly rated ${g.name.toLowerCase()} movies.`} filters={{with_genres:String(g.id),"vote_count.gte":"100"}} page={pn((await searchParams).page)} path={path}/>}
