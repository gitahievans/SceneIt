import { notFound, permanentRedirect } from "next/navigation";
import { tmdbServer } from "@/utils/tmdb/server";
import { mediaPath } from "@/utils/seo/site";

export default async function LegacyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const movie = await tmdbServer.movieDetails(id).catch(() => null);
  if (!movie?.title) notFound();
  permanentRedirect(mediaPath("movie", Number(id), movie.title));
}
