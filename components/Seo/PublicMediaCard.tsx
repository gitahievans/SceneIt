import Link from "next/link";
import MediaImage from "@/components/Common/MediaImage";
import type { ContentKind } from "@/utils/content/collections";
import { mediaPath } from "@/utils/seo/site";

export type PublicMediaItem = {
  id: number;
  title?: string;
  name?: string;
  overview?: string;
  poster_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  vote_count?: number;
};

export function getMediaTitle(item: PublicMediaItem) {
  return item.title || item.name || "Untitled";
}

export default function PublicMediaCard({ item, kind, reason }: {
  item: PublicMediaItem;
  kind: ContentKind;
  reason?: string;
}) {
  const title = getMediaTitle(item);
  const date = item.release_date || item.first_air_date;
  const year = date?.slice(0, 4);
  const rating = item.vote_average ? item.vote_average.toFixed(1) : null;

  return (
    <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <Link href={mediaPath(kind, item.id, title)} className="group block">
        <div className="relative aspect-[2/3] bg-gray-200 dark:bg-gray-800">
          <MediaImage
            path={item.poster_path}
            kind="poster"
            size="w500"
            alt={`${title} poster`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
            className="object-cover transition-transform group-hover:scale-[1.03]"
          />
        </div>
        <div className="p-3">
          <h2 className="font-semibold text-gray-950 group-hover:text-orange-600 dark:text-white">{title}</h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {[year, rating ? `TMDB ${rating}/10` : null, item.vote_count ? `${item.vote_count.toLocaleString("en-US")} votes` : null].filter(Boolean).join(" · ")}
          </p>
          {reason && <p className="mt-2 text-sm leading-5 text-gray-600 dark:text-gray-300">{reason}</p>}
        </div>
      </Link>
    </article>
  );
}
