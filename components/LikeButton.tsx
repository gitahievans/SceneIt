"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./Providers";

export default function LikeButton({ movieId }: { movieId: number }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if user has already liked this movie
  useEffect(() => {
    const checkLikedStatus = async () => {
      if (!user) return;

      try {
        const res = await fetch(`/api/interactions/check?user_id=${user.id}&movie_id=${movieId}&action=favorited`);
        const data = await res.json();
        setLiked(data.exists || false);
      } catch (error) {
        console.error("Error checking liked status:", error);
      }
    };

    console.log('liked', liked);

    checkLikedStatus();
  }, [user, movieId]);

  const toggleLike = async () => {
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

  return (
    <button
      onClick={toggleLike}
      disabled={loading}
      className={`
        group relative flex items-center gap-3 
        px-6 py-3 md:px-8 md:py-4 lg:px-10 lg:py-5
        rounded-2xl font-semibold text-base md:text-lg lg:text-xl
        transition-all duration-300 ease-out
        transform hover:scale-[1.02] active:scale-[0.98]
        shadow-xl hover:shadow-2xl
        border-2 backdrop-blur-sm
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${loading 
          ? 'bg-white/10 border-white/20 text-gray-300' 
          : liked 
            ? 'bg-gradient-to-r from-red-500 to-pink-500 border-red-400 text-white shadow-red-500/25 hover:from-red-600 hover:to-pink-600' 
            : 'bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50 hover:shadow-white/10'
        }
      `}
    >
      <div className="relative">
        <svg 
          className={`w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 transition-all duration-500 ${
            loading
              ? 'fill-none animate-pulse'
              : liked 
                ? 'fill-current animate-pulse' 
                : 'fill-none group-hover:fill-current'
          }`}
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
        
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
        <div className={`absolute inset-0 transform scale-0 bg-white/20 rounded-2xl transition-transform duration-200 ${
          !loading && !liked ? 'group-active:scale-100' : ''
        }`}></div>
      </div>
      
      {liked && !loading && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-400/30 to-pink-400/30 animate-ping"></div>
      )}
    </button>
  );
}