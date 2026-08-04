"use client";

import React, { useEffect, useMemo, useState } from "react";
import { getFavoriteReferences } from "@/utils/supabase/queries";
import type { MediaType } from "@/types/types";
import MediaImage from "@/components/Common/MediaImage";
import { QueryService } from "../services/queryClient";
import Loading from "@/components/Common/Loader";
import Link from "next/link";
import { mediaPath } from "@/utils/seo/site";
import { Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { updateFavorite } from "@/utils/interactions";

type FavoriteMedia = {
  id: number;
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  order: number;
};

type Filter = "all" | MediaType;

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState<FavoriteMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const references = await getFavoriteReferences();
        const results = await Promise.allSettled(references.map(async ({ mediaType, mediaId }, order) => {
          const details = mediaType === "movie"
            ? await QueryService.getMovieDetails(mediaId)
            : await QueryService.getTvDetails(mediaId);
          return {
            id: mediaId,
            mediaType,
            title: details.title || details.name || "Untitled",
            posterPath: details.poster_path || null,
            order,
          } satisfies FavoriteMedia;
        }));
        setFavorites(results.flatMap((result) => result.status === "fulfilled" ? [result.value] : []));
      } catch (error) {
        console.error("Error loading favorites:", error);
        setError("Favorites could not be loaded. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, []);

  const visibleFavorites = useMemo(
    () => filter === "all" ? favorites : favorites.filter((favorite) => favorite.mediaType === filter),
    [favorites, filter]
  );

  const restoreFavorite = (favorite: FavoriteMedia) => {
    setFavorites((current) => {
      const alreadyPresent = current.some(
        (item) => item.mediaType === favorite.mediaType && item.id === favorite.id,
      );
      if (alreadyPresent) return current;
      return [...current, favorite].sort((a, b) => a.order - b.order);
    });
  };

  const removeFavorite = async (favorite: FavoriteMedia) => {
    const matchesFavorite = (item: FavoriteMedia) =>
      item.mediaType === favorite.mediaType && item.id === favorite.id;

    setFavorites((current) => current.filter((item) => !matchesFavorite(item)));

    try {
      await updateFavorite(favorite.mediaType, favorite.id, "unfavorited");

      let undoStarted = false;
      const toastId = toast.success(
        <div className="flex items-center justify-between gap-4">
          <span>{favorite.title} removed from favorites.</span>
          <button
            type="button"
            className="shrink-0 rounded px-2 py-1 font-bold text-orange-300 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400"
            onClick={async () => {
              if (undoStarted) return;
              undoStarted = true;
              toast.dismiss(toastId);
              restoreFavorite(favorite);

              try {
                await updateFavorite(favorite.mediaType, favorite.id, "favorited");
              } catch (undoError) {
                console.error("Error undoing favorite removal:", undoError);
                setFavorites((current) => current.filter((item) => !matchesFavorite(item)));
                toast.error(`Could not restore ${favorite.title} to favorites.`);
              }
            }}
          >
            Undo
          </button>
        </div>,
      );
    } catch (removeError) {
      console.error("Error removing favorite:", removeError);
      restoreFavorite(favorite);
      toast.error(`Could not remove ${favorite.title} from favorites.`);
    }
  };

  if (loading) {
    return (
      <Loading />
    );
  }

  if (error) {
    return <div className="flex min-h-[60vh] items-center justify-center px-6 text-center text-gray-300">{error}</div>;
  }

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">No Favorites Yet</h1>
        <p className="text-gray-400 mt-2 dark:text-gray-300">Favorite a movie or TV show to see it here.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 mb-24">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-black dark:text-white">Your Favorites</h1>
        <div className="flex rounded-full border border-gray-700 p-1" aria-label="Filter favorites">
          {(["all", "movie", "tv"] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${filter === value ? "bg-orange-500 text-white" : "text-gray-400 hover:text-white"}`}
            >
              {value === "all" ? "All" : value === "movie" ? "Movies" : "TV"}
            </button>
          ))}
        </div>
      </div>
      {visibleFavorites.length === 0 ? (
        <p className="py-16 text-center text-gray-400">No {filter === "movie" ? "movie" : "TV"} favorites yet.</p>
      ) : (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {visibleFavorites.map((favorite) => (
          <article
            key={`${favorite.mediaType}-${favorite.id}`}
            className="group relative"
          >
            <Link href={mediaPath(favorite.mediaType, favorite.id, favorite.title)}>
              <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
                <MediaImage
                  path={favorite.posterPath}
                  kind="poster"
                  size="w500"
                  alt={`${favorite.title} poster`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <span className="absolute left-2 top-2 rounded-full bg-black/75 px-2 py-1 text-xs font-semibold uppercase text-white backdrop-blur-sm">
                  {favorite.mediaType === "movie" ? "Movie" : "TV"}
                </span>
              </div>
              <h3 className="text-sm mt-2 font-semibold text-gray-800 dark:text-white truncate">
                {favorite.title}
              </h3>
            </Link>
            <button
              type="button"
              aria-label={`Remove ${favorite.title} from favorites`}
              onClick={() => removeFavorite(favorite)}
              className="absolute right-2 top-2 z-10 flex size-6 items-center justify-center rounded-full border border-white/70 bg-black/85 text-white shadow-lg backdrop-blur-sm transition hover:border-red-300 hover:bg-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400 active:scale-95"
            >
              <Trash2 aria-hidden="true" className="size-3.5" />
            </button>
          </article>
        ))}
      </div>
      )}
    </div>
  );
};

export default FavoritesPage;
