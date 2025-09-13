"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { getUserLikes } from "@/utils/supabase/queries";
import { MovieItem } from "@/types/types";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { QueryService } from "../services/queryClient";
import Loading from "@/components/Loader";

const FavoritesPage = () => {
  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadFavorites = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setMovies([]);
        setLoading(false);
        return;
      }

      try {
        const likedMovieIds = await getUserLikes(user.id);
        console.log("likedMovieIds", likedMovieIds);
        const moviePromises = likedMovieIds.map(id =>
          QueryService.getMovieDetails(id)
        );
        const results = await Promise.all(moviePromises);
        setMovies(results.filter(Boolean));
      } catch (error) {
        console.error("Error loading favorites:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, []);

  console.log(" movies in favorites ", movies);

  if (loading) {
    return (
      <Loading />
    );
  }

  if (movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-xl font-bold text-gray-800">No Favorites Yet</h1>
        <p className="text-gray-400 mt-2">Like some movies to see them here!</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6">
      <h1 className="text-2xl font-bold mb-6 text-black">Movie you Liked</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {movies.map((movie) => (
          <div
            key={movie.id}
            onClick={() => router.push(`/details/${movie.id}`)}
            className="cursor-pointer group"
          >
            <Image
              src={QueryService.getPoster(movie.poster_path)}
              alt={movie.title}
              width={300}
              height={450}
              className="rounded-lg object-cover transition-transform transform group-hover:scale-105"
            />
            <h3 className="text-sm mt-2 font-semibold text-gray-800 truncate">
              {movie.title}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FavoritesPage;
