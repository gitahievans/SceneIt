"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { getUserInterests, getUserLikes } from "@/utils/supabase/queries";
import { QueryService } from "@/app/services/queryClient";
import { MovieItem } from "@/types/types";
import Section from "@/components/Section";

const DiscoverPage = () => {
  const [trending, setTrending] = useState<MovieItem[]>([]);
  const [popular, setPopular] = useState<MovieItem[]>([]);
  const [nowPlaying, setNowPlaying] = useState<MovieItem[]>([]);
  const [genreSections, setGenreSections] = useState<
    { genreId: number; movies: MovieItem[] }[]
  >([]);
  const [recommendations, setRecommendations] = useState<
    { baseMovie: string; movies: MovieItem[] }[]
  >([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDiscover = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      // Always fetch global sections
      const [trendingRes, popularRes, nowPlayingRes] = await Promise.all([
        QueryService.getDailyTrending(),
        QueryService.getPopular(),
        QueryService.getNowPlaying(),
      ]);

      setTrending(trendingRes.results || []);
      setPopular(popularRes.results || []);
      setNowPlaying(nowPlayingRes.results || []);

      // If logged in → personalized sections
      if (user) {
        const interests = await getUserInterests(user.id);
        const likes = await getUserLikes(user.id);

        // Genre-based sections
        const genreResults = await Promise.all(
          interests.map(async (genreId) => {
            const res = await QueryService.getMoviesByGenre(genreId);
            return { genreId, movies: res.results || [] };
          })
        );
        setGenreSections(genreResults);

        // Recommendations based on liked movies
        const recResults = await Promise.all(
          likes.slice(0, 3).map(async (movieId) => {
            const details = await QueryService.getMovieDetails(movieId);
            const recs = await QueryService.getRecommendations(movieId);
            return {
              baseMovie: details.title,
              movies: recs.results || [],
            };
          })
        );
        setRecommendations(recResults);
      }

      setLoading(false);
    };

    loadDiscover();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-400">
        Loading Discover...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-white mb-6">Discover</h1>

      {/* Global sections */}
      <Section title="🔥 Trending Now" movies={trending} />
      <Section title="⭐ Popular" movies={popular} />
      <Section title="🎬 Now Playing" movies={nowPlaying} />

      {/* Personalized genre picks */}
      {genreSections.map((section) => (
        <Section
          key={section.genreId}
          title={`Because you like Genre ${section.genreId}`}
          movies={section.movies}
        />
      ))}

      {/* Recommendations from likes */}
      {recommendations.map((rec, i) => (
        <Section
          key={i}
          title={`Because you liked ${rec.baseMovie}`}
          movies={rec.movies}
        />
      ))}
    </div>
  );
};

export default DiscoverPage;
