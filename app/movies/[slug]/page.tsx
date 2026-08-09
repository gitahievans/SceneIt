import type { Metadata } from "next";
import MediaDetailPage, { getMedia } from "@/components/Seo/MediaDetailPage";
import { mediaPath } from "@/utils/seo/site";
import { pageMetadata } from "@/utils/seo/metadata";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 86400;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params; const result = await getMedia("movie", slug); if (!result) return { title: "Movie not found", robots: { index: false } };
  const movie = result.details; const title = movie.title || "Movie"; const path = mediaPath("movie", movie.id, title);
  return pageMetadata(`${title} — Reviews, Rating & Where to Watch`, movie.overview || `View ${title} details, rating, and streaming availability.`, path);
}
export default async function Page({ params }: Props) { return <MediaDetailPage kind="movie" slug={(await params).slug} />; }
