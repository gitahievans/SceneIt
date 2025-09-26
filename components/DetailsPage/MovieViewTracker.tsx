"use client";

import { useEffect } from "react";
import { useAuth } from "../Common/Providers";

export default function MovieViewTracker({ movieId }: { movieId: number }) {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetch("/api/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          movie_id: movieId,
          action: "viewed",
        }),
      });
    }
  }, [user, movieId]);

  return null;
}
