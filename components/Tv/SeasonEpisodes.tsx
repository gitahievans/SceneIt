"use client";

import Link from "next/link";
import { useState, type MouseEvent } from "react";
import type { TvEpisodeListItem, TvEpisodePage } from "@/types/types";
import EpisodeCard from "./EpisodeCard";

type Props = {
  showId: number;
  seasonNumber: number;
  seasonPath: string;
  initialPage: number;
  totalPages: number;
  initialEpisodes: TvEpisodeListItem[];
};

function pageHref(path: string, page: number) {
  return page === 1 ? path : `${path}?page=${page}`;
}

export default function SeasonEpisodes({
  showId,
  seasonNumber,
  seasonPath,
  initialPage,
  totalPages,
  initialEpisodes,
}: Props) {
  const [episodes, setEpisodes] = useState(initialEpisodes);
  const [lastPage, setLastPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const hasMore = lastPage < totalPages;
  const nextHref = pageHref(seasonPath, lastPage + 1);

  async function loadMore(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const response = await fetch(
        `/api/tmdb/tv/${showId}/seasons/${seasonNumber}/episodes?page=${lastPage + 1}`
      );
      if (!response.ok) throw new Error("Episode page request failed");
      const batch = await response.json() as TvEpisodePage;
      setEpisodes((current) => {
        const existingIds = new Set(current.map((episode) => episode.id));
        return [...current, ...batch.episodes.filter((episode) => !existingIds.has(episode.id))];
      });
      setLastPage(batch.page);
    } catch {
      window.location.assign(nextHref);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {episodes.length ? (
        <div className="grid gap-5" data-testid="episode-list">
          {episodes.map((episode) => <EpisodeCard key={episode.id} episode={episode} />)}
        </div>
      ) : (
        <p className="rounded-xl border border-white/10 bg-white/5 p-6 text-gray-300">Episode information is not available yet.</p>
      )}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        {initialPage > 1 && <Link href={pageHref(seasonPath, initialPage - 1)} prefetch={false} className="rounded-lg border border-white/20 px-5 py-3 font-semibold hover:bg-white/10">Previous 20</Link>}
        {hasMore ? (
          <Link
            href={nextHref}
            prefetch={false}
            onClick={loadMore}
            aria-busy={loading}
            className="rounded-lg bg-orange-500 px-6 py-3 font-semibold text-gray-950 hover:bg-orange-400 aria-disabled:opacity-60"
          >
            {loading ? "Loading…" : "Load more episodes"}
          </Link>
        ) : (
          <button type="button" disabled className="rounded-lg border border-white/10 px-6 py-3 font-semibold text-gray-500">All episodes loaded</button>
        )}
      </div>
    </div>
  );
}
