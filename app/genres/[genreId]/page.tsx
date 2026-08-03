import { notFound, permanentRedirect } from "next/navigation";
import { tmdbServer } from "@/utils/tmdb/server";
import { slugify } from "@/utils/seo/site";
export default async function Page({params}:{params:Promise<{genreId:string}>}){const {genreId}=await params;const data=await tmdbServer.genresFor("movie").catch(()=>null);const genre=data?.genres.find((x)=>String(x.id)===genreId);if(!genre)notFound();permanentRedirect(`/movies/genres/${slugify(genre.name)}`)}
