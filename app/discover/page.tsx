"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { getUserInterests, getUserLikes, getUserSearches, getUserWatched } from "@/utils/supabase/queries";
import { QueryService } from "@/app/services/queryClient";
import { Genre, MovieItem } from "@/types/types";
import Loading from "@/components/Common/Loader";
import Link from "next/link";
import { Edit } from "lucide-react";
import Section from "@/components/Common/Section";
import RecommendationFilter, { createFilterOptions } from "@/components/RecommendationFilter";
import { useAuth } from "@/components/Common/Providers";

const DiscoverPage = () => {
  const [trending, setTrending] = useState<MovieItem[]>([]);
  const [popular, setPopular] = useState<MovieItem[]>([]);
  const [genreSections, setGenreSections] = useState<
    { genreId: number; genreName: string | ""; movies: MovieItem[] }[]
  >([]);
  const [recommendations, setRecommendations] = useState<
    { baseMovie: string; movies: MovieItem[] }[]
  >([]);
  const [searchRecommendations, setSearchRecommendations] = useState<
    { searchTerm: string; movies: MovieItem[] }[]
  >([]);
  const [watchedRecommendations, setWatchedRecommendations] = useState<
    { baseMovie: string; movies: MovieItem[] }[]
  >([]);
  const [activeFilters, setActiveFilters] = useState<string[]>(["all"]);
  const { getMoviesGenreList, getTvShowsGenreList, getDailyTrending, getPopular, getNowPlaying, getMoviesByGenre, getMovieDetails, getRecommendations, searchMovies } = QueryService;
  const [loading, setLoading] = useState(true);
  const [genreNames, setGenreNames] = useState<Record<number, string>>({});
  const user = useAuth().user;

  const getGenreNameFromId = async (genreId: number) => {
    const [moviesGenres, tvGenres] = await Promise.all([getMoviesGenreList(), getTvShowsGenreList()]);
    const allGenres = moviesGenres.genres.concat(tvGenres.genres);
    const genreName = allGenres.find((genre: Genre) => genre.id === genreId)?.name;
    setGenreNames((prev) => ({ ...prev, [genreId]: genreName }));
    return genreName;
  }

  const handleFilterChange = (filters: string[]) => {
    setActiveFilters(filters);
  };

  const shouldShowSection = (sectionType: string) => {
    return activeFilters.includes("all") || activeFilters.includes(sectionType);
  };

  const trendingCount = trending.length + popular.length;
  const interestCount = genreSections.reduce((sum, section) => sum + section.movies.length, 0);
  const searchCount = searchRecommendations.reduce((sum, search) => sum + search.movies.length, 0);
  const favoritesCount = recommendations.reduce((sum, rec) => sum + rec.movies.length, 0);
  const watchedCount = watchedRecommendations.reduce((sum, rec) => sum + rec.movies.length, 0);

  const filterOptions = createFilterOptions(
    trendingCount,
    interestCount,
    searchCount,
    favoritesCount,
    { watched: watchedCount }
  );

  // console.log("genreNames", genreNames);

  useEffect(() => {
    const loadDiscover = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const [trendingRes, popularRes] = await Promise.all([
        getDailyTrending(),
        getPopular(),
      ]);

      setTrending(trendingRes.results || []);
      setPopular(popularRes.results || []);

      if (user) {
        const interests = await getUserInterests(user.id);
        const likes = await getUserLikes(user.id);
        const searches = await getUserSearches(user.id);
        const watched = await getUserWatched(user.id);

        // handle genre based recommendations
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

        // handle watched based recommendations
        const watchedResults = await Promise.all(
          watched.slice(0, 3).map(async (movieId) => {
            const details = await getMovieDetails(movieId);
            const recs = await getRecommendations(movieId);
            return {
              baseMovie: details.title,
              movies: recs.results || [],
            };
          })
        );
        setWatchedRecommendations(watchedResults);

        // handle favorites based recommendations
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

        // handle search based recommendations
        if (searches && searches.length > 0) {
          // get unique search terms (last 5 searches to avoid too many sections)
          const uniqueSearches = [...new Set(searches)].slice(0, 5);

          const searchResults = await Promise.all(
            uniqueSearches.map(async (searchTerm) => {
              try {
                const searchRes = await searchMovies(searchTerm);
                return {
                  searchTerm,
                  movies: searchRes.results?.slice(0, 10) || [], // Limit to 10 results per search
                };
              } catch (error) {
                console.error(`Error searching for ${searchTerm}:`, error);
                return {
                  searchTerm,
                  movies: [],
                };
              }
            })
          );

          // filter out searches with no results
          setSearchRecommendations(searchResults.filter(result => result.movies.length > 0));
        }
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

  const showAllRecommendations = !shouldShowSection("trending") &&
    !shouldShowSection("interests") &&
    !shouldShowSection("searches") &&
    !shouldShowSection("favorites") &&
    !shouldShowSection("watched")

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-2">
      <div className="flex flex-col items-center justify-center space-y-2 p-2">
        <h1 className="text-xl md:text-2xl text-center font-semibold text-black dark:text-white">
          Hey <span className="font-bold text-orange-500">{user?.email?.split("@")[0]}</span>, here are some movie Recommendations for You
        </h1>
        {/* <h3 className="md:text-lg text-center text-gray-600 dark:text-gray-400">Based on your Interests and What's Trending</h3> */}
      </div>

      <RecommendationFilter
        onFilterChange={handleFilterChange}
        filterOptions={filterOptions}
      // className="mb-8"
      />

      {shouldShowSection("trending") && (
        <div className="space-y-8 border-b border-gray-200 dark:border-gray-700 pb-8">
          <h1 className="text-xl md:text-2xl font-bold text-black dark:text-orange-500">
            Trending & Popular
          </h1>
          <Section title="🔥 Trending Now" movies={trending} />
          <Section title="⭐ Popular" movies={popular} />
          {/* <Section title="🎬 Now Playing" movies={nowPlaying} /> */}
        </div>
      )}

      {shouldShowSection("interests") && genreSections.length > 0 && (
        <div className="space-y-8 border-b border-gray-200 dark:border-gray-700 pb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-xl md:text-2xl font-bold text-black dark:text-orange-500">
              Your Interests
            </h1>
            <div className="flex items-center gap-2 text-sm cursor-pointer text-black dark:text-white hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
              <Edit size={14} />
              <Link href="/profile">Edit Interests</Link>
            </div>
          </div>
          {genreSections.map((section) => (
            <Section
              key={section.genreId}
              title={`Because you are interested in "${section.genreName}" movies`}
              movies={section.movies}
            />
          ))}
        </div>
      )}

      {shouldShowSection("searches") && searchRecommendations.length > 0 && (
        <div className="space-y-8 border-b border-gray-200 dark:border-gray-700 pb-8">
          <h1 className="text-xl md:text-2xl font-bold text-black dark:text-orange-500">
            Based on Your Recent Searches
          </h1>
          {searchRecommendations.map((searchRec, i) => (
            <Section
              key={i}
              title={`🔍 More like "${searchRec.searchTerm}"`}
              movies={searchRec.movies}
            />
          ))}
        </div>
      )}

      {shouldShowSection("favorites") && recommendations.length > 0 && (
        <div className="space-y-8">
          <h1 className="text-xl md:text-2xl font-bold text-black dark:text-orange-500">
            Similar to your Favorites
          </h1>
          {recommendations.map((rec, i) => (
            <Section
              key={i}
              title={`❤️ Because you liked "${rec.baseMovie}"`}
              movies={rec.movies}
            />
          ))}
        </div>
      )}

      {shouldShowSection("watched") && watchedRecommendations.length > 0 && (
        <div className="space-y-8">
          <h1 className="text-xl md:text-2xl font-bold text-black dark:text-orange-500">
            Similar to what you watched
          </h1>
          {watchedRecommendations.map((rec, i) => (
            <Section
              key={i}
              title={`🎬 Because you watched "${rec.baseMovie}"`}
              movies={rec.movies}
            />
          ))}
        </div>
      )}

      {showAllRecommendations && (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Edit className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No recommendations match your filters
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Try adjusting your filters or check back later for more recommendations.
            </p>
            <button
              onClick={() => setActiveFilters(["all"])}
              className="inline-flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
            >
              Show All Recommendations
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscoverPage;