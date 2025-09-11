"use client";

import { useEffect } from "react";
import { useAuth } from "./Providers";

export default function DetailsClient({ movieId }: { movieId: number }) {
  const { user } = useAuth();
  console.log("user in details client", user);
  console.log("movieId in details client", movieId);

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
