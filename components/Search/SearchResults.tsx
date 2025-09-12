import Image from 'next/image';
import React, { useState } from 'react'
import { Genre, MovieItem } from '@/types/types';
import { Search } from 'lucide-react';
import { QueryService } from '@/app/services/queryClient';

const SearchResults = ({ item,
    handleResultClick,
    formatReleaseDate,
    truncateText,
    getPoster
}: {
    item: MovieItem;
    handleResultClick: (id: number) => void;
    formatReleaseDate: (dateString: string) => string;
    truncateText: (text: string, maxLength: number) => string;
    getPoster: (path: string) => string;
}) => {
    console.log("item in search results", item);
    const { getGenres } = QueryService;
    const [genreNames, setGenreNames] = useState<string[]>([]);
    getGenres().then((data) => {
        const genreNames = data.genres.filter((genre: Genre) => item.genre_ids.includes(genre.id)).map((genre: Genre) => genre.name);
        setGenreNames(genreNames);
    });

    return (
        <div
            key={item.id}
            onClick={() => handleResultClick(item.id)}
            className="px-6 py-4 hover:bg-gray-900 cursor-pointer transition-colors border-b border-gray-800 last:border-b-0"
        >
            <div className="flex items-start space-x-4">
                <div className="w-20 h-28 bg-gray-800 rounded flex-shrink-0 overflow-hidden">
                    {item.poster_path ? (
                        <Image
                            src={getPoster(item.poster_path)}
                            alt={item.title}
                            width={80}
                            height={120}
                            className="object-cover w-full h-full"
                            placeholder="blur"
                            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Search className="w-8 h-8" />
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="text-gray-300 font-semibold text-base truncate">
                        {item.title}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                        {truncateText(item.overview, 120)}
                    </p>
                    <div className="flex items-center mt-2 space-x-2">
                        {item.release_date && (
                            <span className="text-xs text-gray-500">
                                {formatReleaseDate(item.release_date)}
                            </span>
                        )}
                        {item.vote_average && (
                            <span className="text-xs text-orange-400">
                                ★ {item.vote_average.toFixed(1)}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center mt-2 space-x-2 ">
                        {genreNames.map((genre: string) => (
                            <span key={genre} className="text-xs text-gray-400 border border-gray-800/20 bg-orange-800/20 rounded-full px-3 py-1">
                                {genre}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SearchResults;