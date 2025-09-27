// app/api/ai/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getUserInterests, getUserLikes, getUserSearches, getUserWatched } from "@/utils/supabase/queries";
import { QueryService } from "@/app/services/queryClient";
import { chatChain } from "@/utils/ai";

export async function POST(request: NextRequest) {
  try {
    console.log("=== Chat API Debug Start ===");
    
    const { message, userId } = await request.json();
    console.log("Received:", { message: message?.substring(0, 50), userId });

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Build context from user data if userId is provided
    let context = "General movie database context.";
    
    if (userId) {
      try {
        console.log("Fetching user data for:", userId);
        
        // Get user profile data with individual error handling
        const userDataPromises = [
          getUserInterests(userId).catch(err => {
            console.error("getUserInterests error:", err);
            return [];
          }),
          getUserLikes(userId).catch(err => {
            console.error("getUserLikes error:", err);
            return [];
          }),
          getUserSearches(userId).then(searches => searches.map(s => s.query)).catch(err => {
            console.error("getUserSearches error:", err);
            return [];
          }),
          getUserWatched(userId).catch(err => {
            console.error("getUserWatched error:", err);
            return [];
          })
        ];

        const [interests, likes, searches, watched] = await Promise.all(userDataPromises);
        console.log("User data fetched:", { 
          interestsCount: interests.length, 
          likesCount: likes.length, 
          searchesCount: searches.length, 
          watchedCount: watched.length 
        });

        // Get trending and popular movies with error handling
        const movieDataPromises = [
          QueryService.getDailyTrending().catch(err => {
            console.error("getDailyTrending error:", err);
            return { results: [] };
          }),
          QueryService.getPopular().catch(err => {
            console.error("getPopular error:", err);
            return { results: [] };
          })
        ];

        const [trending, popular] = await Promise.all(movieDataPromises);
        console.log("Movie data fetched:", { 
          trendingCount: trending.results?.length || 0, 
          popularCount: popular.results?.length || 0 
        });

        // Get genre names for interests
        let genreNames: string[] = [];
        if (interests.length > 0) {
          try {
            const [moviesGenres, tvGenres] = await Promise.all([
              QueryService.getMoviesGenreList().catch(() => ({ genres: [] })),
              QueryService.getTvShowsGenreList().catch(() => ({ genres: [] }))
            ]);
            const allGenres = moviesGenres.genres.concat(tvGenres.genres);
            genreNames = interests.map(genreId => 
              allGenres.find((genre: any) => genre.id === genreId)?.name || "Unknown"
            ).filter(Boolean);
          } catch (error) {
            console.error("Error fetching genres:", error);
          }
        }

        // Get details for liked movies (limit to 3 most recent for context)
        let likedMovieDetails: any[] = [];
        if (likes.length > 0) {
          const likedMoviePromises = likes.slice(0, 3).map(async (movieId) => {
            try {
              return await QueryService.getMovieDetails(movieId);
            } catch (error) {
              console.error(`Error fetching movie ${movieId}:`, error);
              return null;
            }
          });
          likedMovieDetails = (await Promise.all(likedMoviePromises)).filter(Boolean);
        }

        // Get details for watched movies (limit to 3 most recent for context)
        let watchedMovieDetails: any[] = [];
        if (watched.length > 0) {
          const watchedMoviePromises = watched.slice(0, 3).map(async (movieId) => {
            try {
              return await QueryService.getMovieDetails(movieId);
            } catch (error) {
              console.error(`Error fetching watched movie ${movieId}:`, error);
              return null;
            }
          });
          watchedMovieDetails = (await Promise.all(watchedMoviePromises)).filter(Boolean);
        }

        // Build comprehensive context
        const contextData = {
          userProfile: {
            interestedGenres: genreNames,
            recentSearches: searches.slice(0, 5), // Reduced to 5 searches
            favoriteMovies: likedMovieDetails.map(movie => ({
              title: movie.title,
              genre_ids: movie.genre_ids,
              overview: movie.overview?.substring(0, 200), // Truncate overview
              release_date: movie.release_date
            })),
            watchedMovies: watchedMovieDetails.map(movie => ({
              title: movie.title,
              genre_ids: movie.genre_ids,
              overview: movie.overview?.substring(0, 200), // Truncate overview
              release_date: movie.release_date
            }))
          },
          availableContent: {
            trendingMovies: trending.results?.slice(0, 5).map((movie: any) => ({
              title: movie.title,
              overview: movie.overview?.substring(0, 150),
              genre_ids: movie.genre_ids,
              release_date: movie.release_date,
              vote_average: movie.vote_average
            })) || [],
            popularMovies: popular.results?.slice(0, 5).map((movie: any) => ({
              title: movie.title,
              overview: movie.overview?.substring(0, 150),
              genre_ids: movie.genre_ids,
              release_date: movie.release_date,
              vote_average: movie.vote_average
            })) || []
          }
        };

        context = JSON.stringify(contextData);
        console.log("Context built successfully, length:", context.length);

      } catch (error) {
        console.error("Error building user context:", error);
        // Continue with basic context if user data fetch fails
      }
    }

    // Check if required environment variables are present
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY not found in environment variables");
      return NextResponse.json(
        { error: "AI service configuration error" },
        { status: 500 }
      );
    }

    console.log("Calling AI chat chain...");
    // Call the AI chat chain
    const aiResponse = await chatChain({
      context,
      question: message,
    });

    console.log("AI response received:", aiResponse.content);

    return NextResponse.json({
      response: aiResponse.content || "I'm sorry, I couldn't generate a response at the moment."
    });

  } catch (error) {
    console.error("=== Chat API Error ===");
    console.error("Error details:", error);
    console.error("Stack trace:", error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
      },
      { status: 500 }
    );
  }
}