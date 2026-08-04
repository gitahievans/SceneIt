"use client";

import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { Heart } from "lucide-react";
import { useAuth } from "../Common/Providers";
import { trackEvent } from "../Analytics/AnalyticsConsent";
import type { MediaType } from "@/types/types";
import { updateFavorite } from "@/utils/interactions";

export const toggleLike = async (user: User | null, mediaType: MediaType, mediaId: number | undefined, liked: boolean, setLiked: (liked: boolean) => void, setLoading: (loading: boolean) => void) => {
  if (!user) return alert("Log in to favorite this title");
  if (!mediaId) return;

  setLoading(true);

  try {
    await updateFavorite(mediaType, mediaId, liked ? "unfavorited" : "favorited");
    setLiked(!liked);
  } catch (error) {
    console.error("Error toggling like:", error);
    const message = error instanceof Error ? error.message : "Failed to update like status";
    alert(`Failed to update favorite: ${message}`);
  } finally {
    setLoading(false);
  }
};

export const checkLikedStatus = async (user: User | null, mediaType: MediaType, mediaId: number | undefined, setLiked: (liked: boolean) => void) => {
  if (!user || !mediaId) return;

  try {
    const params = new URLSearchParams({ media_type: mediaType, media_id: String(mediaId), action: "favorited" });
    const res = await fetch(`/api/interactions/check?${params}`);
    if (!res.ok) throw new Error("Favorite status request failed");
    const data = await res.json();
    setLiked(data.exists || false);
  } catch (error) {
    console.error("Error checking liked status:", error);
  }
};

export default function LikeButton({ mediaType, mediaId }: { mediaType: MediaType; mediaId: number | undefined }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkLikedStatus(user, mediaType, mediaId, setLiked);
  }, [user, mediaType, mediaId]);

  return (
    <button
      onClick={() => { trackEvent("favorite_save_attempted", { media_type: mediaType, media_id: mediaId || 0, authenticated: Boolean(user) }); toggleLike(user, mediaType, mediaId, liked, setLiked, setLoading); }}
      disabled={loading}
      className={`
        group relative flex items-center gap-3 
         p-4 
        rounded-2xl font-semibold
        transition-all duration-300 ease-out
        transform hover:scale-[1.02] active:scale-[0.98]
        shadow-xl hover:shadow-2xl
        border backdrop-blur-sm
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${loading
          ? 'bg-white/10 border-white/20 text-gray-300'
          : liked
            ? 'bg-gradient-to-r from-red-700 to-pink-700 border-red-400 text-white shadow-red-500/25 hover:from-red-600 hover:to-pink-600'
            : 'bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50 hover:shadow-white/10'
        }
      `}
    >
      <div className="relative">
       <Heart />

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      <span className="font-bold tracking-wide">
        {loading
          ? 'Processing...'
          : liked
            ? 'Added to Favorites'
            : 'Add to Favorites'
        }
      </span>

      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        <div className={`absolute inset-0 transform scale-0 bg-white/20 rounded-2xl transition-transform duration-200 ${!loading && !liked ? 'group-active:scale-100' : ''
          }`}></div>
      </div>

      {/* {liked && !loading && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-400/30 to-pink-400/30 animate-ping"></div>
      )} */}
    </button>
  );
}
