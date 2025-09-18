"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { QueryService } from "@/app/services/queryClient";
import { getUserInterests } from "@/utils/supabase/queries";
import { useAuth } from "./Providers";
import { MovieItem } from "@/types/types";
import { toggleLike, checkLikedStatus } from "./LikeButton";
import { useRouter } from "next/navigation";
import { Check, Plus, TicketCheck } from "lucide-react";
import Loading from "./Loader";
import Image from "next/image";
import LoginModal from "./LoginModal";
import { useDisclosure } from "@mantine/hooks";

function DiscoverHero() {
    const { user } = useAuth();
    const { getMovieVideos, getMoviesByGenre, getPopularMovies } = QueryService;
    const [liked, setLiked] = useState(false);
    const [loading, setLoading] = useState(false);
    const { data: userInterests } = useQuery({
        queryKey: ["user-interests", user?.id],
        queryFn: () => (user ? getUserInterests(user.id) : []),
        enabled: !!user,
    });
    const [opened, { open, close }] = useDisclosure();
    const [action, setAction] = useState<string | null>(null);
    const router = useRouter();

    // console.log("userInterests", userInterests);
    const { data: movies } = useQuery({
        queryKey: ["discover-movies", userInterests],
        queryFn: async () => {
            if (userInterests && userInterests.length > 0) {
                const genreId = userInterests[0];
                const res = await getMoviesByGenre(genreId);
                console.log("movies from genre", genreId, res);
                return res.results;
            } else {
                const res = await getPopularMovies();
                console.log("movies from popular", res);
                return res.results;
            }
        },
        enabled: !!userInterests || !user,
    });
    console.log("movies from user interests", movies);

    const [mainMovie, sideMovies] = useMemo<[null | MovieItem, MovieItem[]]>(() => {
        if (!movies || movies.length === 0) return [null, []];
        const shuffled = [...movies].sort(() => Math.random() - 0.5);
        return [shuffled[0], shuffled.slice(1, 3)];
    }, [movies]);

    console.log("mainMovie", mainMovie);

    const handleWatchClick = () => {
        if (!user) {
            setAction("watch");
            open();
            return;
        } else {
            router.push(`/watch/${mainMovie?.id}`);
        }
    }

    const handleLikeClick = () => {
        if (!user) {
            setAction("add to favorites");
            open();
            return;
        } else {
            toggleLike(user!, mainMovie?.id, liked, setLiked, setLoading);
        }
    }

    const { data: videos } = useQuery({
        queryKey: ["movie-videos", mainMovie?.id],
        queryFn: () => getMovieVideos(mainMovie?.id as number),
        enabled: !!mainMovie,
    });

    const randomVideo = useMemo(() => {
        if (!videos?.results || videos.results.length === 0) return null;
        return videos.results[Math.floor(Math.random() * videos.results.length)];
    }, [videos]);

    useEffect(() => {
        checkLikedStatus(user, mainMovie?.id, setLiked);
    }, [user, mainMovie?.id]);

    if (!mainMovie) {
        return (
            <Loading />
        );
    }

    return (
        <div className="mx-4">
            <LoginModal action={action || ""} opened={opened} close={close} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 h-[70vh] max-w-7xl mx-auto">
                <div className="col-span-1 md:col-span-2 relative rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br from-gray-900 to-black shadow-2xl group">
                    <div className="absolute inset-0">
                        {randomVideo ? (
                            <iframe
                                src={`https://www.youtube.com/embed/${randomVideo.key}?autoplay=1&mute=1&loop=1&playlist=${randomVideo.key}&controls=0&modestbranding=1&rel=0`}
                                title={randomVideo.name}
                                className="w-full h-full object-cover"
                                allow="autoplay; fullscreen"
                                style={{ border: 'none' }}
                            />
                        ) : (
                            <Image
                                src={`https://image.tmdb.org/t/p/original${mainMovie.backdrop_path}`}
                                alt={mainMovie.title}
                                fill
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                        )}
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent"></div>

                    <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 lg:p-10">
                        <div className="flex items-center mb-4">
                            <div className="flex items-center space-x-2 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                                <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                                <span className="text-white text-sm font-medium">
                                    {mainMovie.vote_average?.toFixed(1)}
                                </span>
                            </div>
                        </div>

                        <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4 leading-tight drop-shadow-lg clamp-1">
                            {mainMovie.title}
                        </h1>

                        <p className="text-gray-200 text-base md:text-lg mb-6 md:mb-8 line-clamp-2 md:line-clamp-3 max-w-2xl leading-relaxed drop-shadow-sm">
                            {mainMovie.overview}
                        </p>

                        <div className="flex flex-row gap-3 md:gap-4">
                            <button onClick={handleWatchClick} className="group/btn relative w-1/2 md:w-auto py-2 md:px-8 md:py-4 bg-transparent border border-white/20 md:bg-gradient-to-r from-gray-600 to-black rounded-xl md:rounded-2xl font-semibold text-white shadow-lg md:hover:shadow-orange-500/25 md:hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative flex items-center justify-center space-x-2">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                    <span>Watch Now</span>
                                </div>
                            </button>

                            <button
                                onClick={handleLikeClick}
                                className="w-1/2 md:w-auto px-8 py-2 md:py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl md:rounded-2xl font-semibold text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300 transform hover:scale-105">
                                <div className="flex items-center justify-center space-x-2">
                                    {liked ? <Check /> : <Plus />}
                                    <span>{liked ? "Remove" : "Favorite"}</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="absolute top-6 right-6 w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <div className="absolute top-10 right-4 w-1 h-1 bg-white/50 rounded-full animate-pulse delay-500"></div>
                </div>

                <div className="flex flex-col gap-4 md:gap-6 h-full">
                    {sideMovies.map((movie: MovieItem, index: number) => (
                        <div
                            key={movie?.id}
                            className="relative flex-1 rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer group bg-gradient-to-br from-gray-800 to-gray-900 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02]"
                            style={{
                                animationDelay: `${index * 100}ms`,
                                animation: 'fadeInUp 0.6s ease-out forwards'
                            }}
                        >
                            <Image
                                src={`https://image.tmdb.org/t/p/w780${movie?.backdrop_path || movie?.poster_path}`}
                                alt={movie?.title}
                                fill
                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent group-hover:from-black/70 transition-all duration-500"></div>

                            <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6">
                                <div className="flex items-center mb-2">
                                    <div className="flex items-center space-x-1 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
                                        <svg className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 24 24">
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                        </svg>
                                        <span className="text-white text-xs font-medium">
                                            {movie?.vote_average?.toFixed(1)}
                                        </span>
                                    </div>
                                </div>

                                <h2 className="text-lg md:text-xl font-bold text-white leading-tight drop-shadow-lg group-hover:text-orange-300 transition-colors duration-300">
                                    {movie?.title}
                                </h2>

                                <p className="text-gray-300 text-sm mt-1 line-clamp-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                    {movie?.overview}
                                </p>
                            </div>

                            <div onClick={() => router.push(`/details/${movie?.id}`)} className="absolute z-50 inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-500/90 rounded-full flex items-center justify-center backdrop-blur-sm transform scale-75 group-hover:scale-100 transition-transform duration-300">
                                    <svg className="w-6 h-6 md:w-8 md:h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                            </div>

                            <div className="absolute inset-0 rounded-2xl md:rounded-3xl border border-transparent group-hover:border-orange-500/30 group-hover:shadow-orange-500/20 transition-all duration-500"></div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-500/5 rounded-full blur-3xl"></div>
            </div>

            <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        @media (max-width: 768px) {
          .line-clamp-3 {
            -webkit-line-clamp: 2;
          }
        }
      `}</style>
        </div>
    );
}

export default DiscoverHero;