import { QueryService } from '@/app/services/queryClient';
import Image from 'next/image';
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

    const { getPoster } = QueryService;
    const releaseYear = new Date(movie.release_date).getFullYear();
    const getRatingColor = (rating: number) => {
        if (rating >= 8) return 'text-green-500';
        if (rating >= 7) return 'text-yellow-500';
        if (rating >= 6) return 'text-orange-500';
        return 'text-red-500';
    };


    return (
        <div className="group relative w-full max-w-sm mx-auto">
            <div className="relative bg-gradient-to-br from-white to-gray-50
                      rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 
                      transform hover:-translate-y-2 hover:scale-[1.02] overflow-hidden
                      border border-gray-200 ">
                <div className="relative  overflow-hidden rounded-t-lg">
                    <Image
                        src={getPoster(movie.poster_path)}
                        alt={movie.title}
                        width={500}
                        height={500}
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        priority={false}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-black/80 backdrop-blur-sm rounded-full 
                              px-2 py-0.5 sm:px-2.5 sm:py-1 flex items-center gap-1 text-white text-xs font-medium shadow-lg">
                        <span className="text-yellow-400 text-xs">⭐</span>
                        <span className={getRatingColor(movie.vote_average)}>
                            {movie.vote_average.toFixed(1)}
                        </span>
                    </div>

                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-white/90 backdrop-blur-sm 
                              rounded-full px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs font-semibold text-gray-800 
                              shadow-lg">
                        {releaseYear}
                    </div>
                </div>

                <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                    <h3 className="font-bold text-sm sm:text-base leading-tight text-gray-900 
                             group-hover:text-blue-600 
                             transition-colors duration-200 line-clamp-1">
                        {movie.title}
                    </h3>

                    <p className="hidden sm:block text-xs text-gray-600 leading-relaxed line-clamp-3 
                             group-hover:text-gray-700 transition-colors duration-200">
                        {movie.overview.substring(0, 50) + '...'}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                        <span className="text-xs text-gray-500 font-medium">
                            {new Date(movie.release_date).toLocaleDateString('en-US', {
                                month: 'short',
                                year: 'numeric'
                            })}
                        </span>
                        <div className="flex items-center gap-1 px-1.5 sm:px-2 py-1 bg-gray-100 
                                  rounded-full transition-colors duration-200 hover:bg-yellow-50 ">
                            <span className="text-yellow-500 text-xs">⭐</span>
                            <span className={`text-xs font-semibold ${getRatingColor(movie.vote_average)}`}>
                                {movie.vote_average.toFixed(1)}
                            </span>
                        </div>
                    </div>
                </div>


                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
                          -translate-x-full group-hover:translate-x-full transition-transform duration-1000 
                          pointer-events-none" />
            </div>
        </div>
    )
}

export default MovieCard;