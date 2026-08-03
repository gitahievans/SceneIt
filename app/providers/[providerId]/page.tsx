import { notFound, permanentRedirect } from "next/navigation";
import { tmdbServer } from "@/utils/tmdb/server";
import { providerAllowlist } from "@/utils/content/providers";
export default async function Page({params}:{params:Promise<{providerId:string}>}){const {providerId}=await params;const data=await tmdbServer.movieProviders("US").catch(()=>null);const p=data?.results.find((x)=>String(x.provider_id)===providerId);if(!p)notFound();const allowed=providerAllowlist.find((x)=>p.provider_name===x.name||p.provider_name.startsWith(x.name));if(!allowed)notFound();permanentRedirect(`/movies/providers/${allowed.slug}`)}
