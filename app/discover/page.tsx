"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { getUserInterests, getUserLikes } from "@/utils/supabase/queries";
import { QueryService } from "@/app/services/queryClient";
import { Genre, MovieItem } from "@/types/types";
import Section from "@/components/Section";
import Loading from "@/components/Loader";
import Link from "next/link";
import { Edit } from "lucide-react";

const DiscoverPage = () => {
  const [trending, setTrending] = useState<MovieItem[]>([]);
  const [popular, setPopular] = useState<MovieItem[]>([]);
  const [nowPlaying, setNowPlaying] = useState<MovieItem[]>([]);
  const [genreSections, setGenreSections] = useState<
    { genreId: number; genreName: string | ""; movies: MovieItem[] }[]
  >([]);
  const [recommendations, setRecommendations] = useState<
    { baseMovie: string; movies: MovieItem[] }[]
  >([]);
  const { getMoviesGenreList, getTvShowsGenreList, getDailyTrending, getPopular, getNowPlaying, getMoviesByGenre, getMovieDetails, getRecommendations } = QueryService;
  const [loading, setLoading] = useState(true);
  const [genreNames, setGenreNames] = useState<Record<number, string>>({});

  const getGenreNameFromId = async (genreId: number) => {
    const [moviesGenres, tvGenres] = await Promise.all([getMoviesGenreList(), getTvShowsGenreList()]);
    const allGenres = moviesGenres.genres.concat(tvGenres.genres);
    const genreName = allGenres.find((genre: Genre) => genre.id === genreId)?.name;
    setGenreNames((prev) => ({ ...prev, [genreId]: genreName }));
    return genreName;
  }

  console.log("genreNames", genreNames);



  useEffect(() => {
    const loadDiscover = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const [trendingRes, popularRes, nowPlayingRes] = await Promise.all([
        getDailyTrending(),
        getPopular(),
        getNowPlaying(),
      ]);

      setTrending(trendingRes.results || []);
      setPopular(popularRes.results || []);
      setNowPlaying(nowPlayingRes.results || []);

      if (user) {
        const interests = await getUserInterests(user.id);
        const likes = await getUserLikes(user.id);

        const genreResults = await Promise.all(
          interests.map(async (genreId) => {
            const [res, genreName] = await Promise.all([
              getMoviesByGenre(genreId),
              getGenreNameFromId(genreId)
            ]);
            return { genreId, genreName: genreName || "", movies: res.results || [] };
          })
        );
        setGenreSections(genreResults);

        const recResults = await Promise.all(
          likes.slice(0, 3).map(async (movieId) => {
            const details = await getMovieDetails(movieId);
            const recs = await getRecommendations(movieId);
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
      <Loading />
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-2">
      <div className="flex flex-col items-center justify-center space-y-2 p-2">
        <h1 className="text-xl md:text-2xl font-semibold text-black dark:text-white">
          Here are Recommendations for You
        </h1>
        <h3 className="md:text-lg text-gray-600 dark:text-gray-400">Based on your Interests and What's Trending</h3>
      </div>

      <div className="space-y-8 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl md:text-2xl font-bold text-black dark:text-orange-500">
          Trending & Popular
        </h1>
        <Section title="🔥 Trending Now" movies={trending} />
        <Section title="⭐ Popular" movies={popular} />
        {/* <Section title="🎬 Now Playing" movies={nowPlaying} /> */}
      </div>

      <div className="space-y-8 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold text-black dark:text-orange-500">
            Your Interests
          </h1>
          <div className="flex items-center gap-2 text-sm cursor-pointer text-black dark:text-white">
            <Edit size={14} />
            <Link href="/profile">Edit Interests</Link>
          </div>
        </div>
        {genreSections.map((section) => (
          <Section
            key={section.genreId}
            title={`Because you are interested in ${section.genreName} movies`}
            movies={section.movies}
          />
        ))}
      </div>

      <div className="space-y-8">
        <h1 className="text-xl md:text-2xl font-bold text-black dark:text-orange-500">
          Similar to your Favorites
        </h1>
        {recommendations.map((rec, i) => (
          <Section
            key={i}
            title={`Because you liked ${rec.baseMovie}`}
            movies={rec.movies}
          />
        ))}
      </div>
    </div>
  );
};

export default DiscoverPage;
