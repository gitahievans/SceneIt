"use client";

import { useState } from "react";
import { useAuth } from "./Providers";

export default function LikeButton({ movieId }: { movieId: number }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);

  const toggleLike = async () => {
    if (!user) return alert("Log in to like this movie");

    const res = await fetch("/api/interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.id,
        movie_id: movieId,
        action: "favorited",
      }),
    });

    if (res.ok) {
      setLiked(!liked);
    }
  };

  return (
    <button
      onClick={toggleLike}
      className={`px-3 py-1 rounded ${liked ? "bg-red-500" : "bg-gray-500"}`}
    >
      {liked ? "❤️ Unlike" : "🤍 Like"}
    </button>
  );
}
