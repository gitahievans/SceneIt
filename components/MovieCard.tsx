import { QueryService } from '@/app/services/queryClient';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react'

export interface MovieCardProps {
    movie: {
        id: number;
        title: string;
        overview: string;
        release_date: string;
        poster_path: string;
        vote_average: number;
    }
}

const MovieCard = ({ movie }: MovieCardProps) => {
    const router = useRouter();
    const { getPoster } = QueryService;
    const releaseYear = new Date(movie.release_date).getFullYear();
    const getRatingColor = (rating: number) => {
        if (rating >= 8) return 'text-green-500 dark:text-green-400';
        if (rating >= 7) return 'text-yellow-500 dark:text-yellow-400';
        if (rating >= 6) return 'text-orange-500 dark:text-orange-400';
        return 'text-red-500 dark:text-red-400';
    };

    const handleCardPress = () => {
        router.push(`/details/${movie.id}`);
    }

    return (
        <div className="group relative w-full max-w-sm mx-auto">
            <div className="relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 cursor-pointer
                      rounded-2xl shadow-md hover:shadow-2xl dark:shadow-gray-900/50 dark:hover:shadow-2xl transition-all duration-500 
                      transform hover:-translate-y-2 hover:scale-[1.02] overflow-hidden
                      border border-gray-200 dark:border-gray-700">
                <div className="relative overflow-hidden rounded-t-lg">
                    <div className="relative cursor-pointer" onClick={handleCardPress}>
                        <Image
                            src={getPoster(movie.poster_path)}
                            alt={movie.title}
                            width={500}
                            height={500}
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            priority={false}
                            loading="lazy"
                            unoptimized
                        />
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        onClick={handleCardPress}
                    />

                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-black/80 dark:bg-black/90 backdrop-blur-sm rounded-full 
                              px-2 py-0.5 sm:px-2.5 sm:py-1 flex items-center gap-1 text-white text-xs font-medium shadow-lg">
                        <span className="text-yellow-400">⭐</span>
                        <span className={getRatingColor(movie.vote_average)}>
                            {movie.vote_average.toFixed(1)}
                        </span>
                    </div>

                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm 
                              rounded-full px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs font-semibold text-gray-800 dark:text-gray-200
                              shadow-lg">
                        {releaseYear}
                    </div>
                </div>

                <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                    <h3 className="font-bold text-sm sm:text-base leading-tight text-gray-900 dark:text-gray-100
                             group-hover:text-blue-600 dark:group-hover:text-blue-400
                             transition-colors duration-500 line-clamp-1">
                        {movie.title}
                    </h3>

                    <p className="hidden sm:block text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3 
                             group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-500">
                        {movie.overview.substring(0, 50) + '...'}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            {new Date(movie.release_date).toLocaleDateString('en-US', {
                                month: 'short',
                                year: 'numeric'
                            })}
                        </span>
                        <div className="flex items-center gap-1 px-1.5 sm:px-2 py-1 bg-gray-100 dark:bg-gray-800
                                  rounded-full transition-colors duration-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20">
                            <span className="text-yellow-500 dark:text-yellow-400">⭐</span>
                            <span className={`text-xs font-semibold ${getRatingColor(movie.vote_average)}`}>
                                {movie.vote_average.toFixed(1)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent 
                          -translate-x-full group-hover:translate-x-full transition-transform duration-1000 
                          pointer-events-none" />
            </div>
        </div>
    )
}

export default MovieCard;