import type { Metadata } from "next";
import MediaDetailPage, { getMedia } from "@/components/Seo/MediaDetailPage";
import { mediaPath } from "@/utils/seo/site";
import { pageMetadata } from "@/utils/seo/metadata";

type Props = { params: Promise<{ slug: string }> };

// Long enough to keep ISR writes low, short enough to pick up new episodes.
export const revalidate = 259200; // 3 days

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params; const result = await getMedia("tv", slug); if (!result) return { title: "TV show not found", robots: { index: false } };
  const show = result.details; const title = show.name || "TV Show"; const path = mediaPath("tv", show.id, title);
  return pageMetadata(`${title} — Episodes, Rating & Where to Watch`, show.overview || `View ${title} details, rating, and streaming availability.`, path);
}
export default async function Page({ params }: Props) { return <MediaDetailPage kind="tv" slug={(await params).slug} />; }
