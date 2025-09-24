"use client";

import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { Heart } from "lucide-react";
import { useAuth } from "../Common/Providers";

export const toggleLike = async (user: User | null, movieId: number | undefined, liked: boolean, setLiked: (liked: boolean) => void, setLoading: (loading: boolean) => void) => {
  if (!user) return alert("Log in to like this movie");

  setLoading(true);

  try {
    const action = liked ? "unfavorited" : "favorited";

    const res = await fetch("/api/interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.id,
        movie_id: movieId,
        action,
      }),
    });

    if (res.ok) {
      setLiked(!liked);
    } else {
      const errorData = await res.json();
      alert(`Failed to ${action.replace('ed', '')} movie: ${errorData.error}`);
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    alert("Failed to update like status");
  } finally {
    setLoading(false);
  }
};

export const checkLikedStatus = async (user: User | null, movieId: number | undefined, setLiked: (liked: boolean) => void) => {
  if (!user) return;

  try {
    const res = await fetch(`/api/interactions/check?user_id=${user.id}&movie_id=${movieId}&action=favorited`);
    const data = await res.json();
    setLiked(data.exists || false);
  } catch (error) {
    console.error("Error checking liked status:", error);
  }
};

export default function LikeButton({ movieId }: { movieId: number | undefined }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkLikedStatus(user, movieId, setLiked);
  }, [user, movieId]);

  return (
    <button
      onClick={() => toggleLike(user, movieId, liked, setLiked, setLoading)}
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