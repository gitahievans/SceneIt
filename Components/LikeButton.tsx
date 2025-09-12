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
      className={`px-3 py-1 rounded transition-colors ${
        loading 
          ? "bg-gray-400 cursor-not-allowed" 
          : liked 
            ? "bg-red-500 hover:bg-red-600" 
            : "bg-gray-500 hover:bg-gray-600"
      }`}
    >
      {loading ? "..." : liked ? "❤️ Unlike" : "🤍 Like"}
    </button>
  );
}