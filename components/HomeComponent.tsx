"use client"

import React, { useState, useMemo, useEffect, Suspense } from 'react'
import { useQueries, useQuery } from '@tanstack/react-query';
import Section from '@/components/Section';
import { MovieResponse, Genre, GenreResponse } from '@/types/types';
import EmailConfirmationModal from '@/components/EmailConfirmationModal';
import { QueryService } from '@/app/services/queryClient';
import HomeHeroSection from './HomeHeroSection';
import Loading from './Loader';

const GENRES_PER_PAGE = 4;

const HomePageContent = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [loadedGenres, setLoadedGenres] = useState<Set<number>>(new Set());

    const { data: moviesData, isLoading: moviesLoading, error } = useQuery<MovieResponse>({
        queryKey: ['movies'],
        queryFn: QueryService.getDailyTrending as () => Promise<MovieResponse>,
    });

    const { data: genresData, isLoading: genresLoading } = useQuery<GenreResponse>({
        queryKey: ['genres'],
        queryFn: QueryService.getGenres as () => Promise<GenreResponse>,
    });

    const genresList = useMemo(() => {
        return genresData?.genres || [];
    }, [genresData]);

    const totalPages = Math.ceil(genresList.length / GENRES_PER_PAGE);

    const paginatedGenres = useMemo(() => {
        const startIndex = (currentPage - 1) * GENRES_PER_PAGE;
        const endIndex = startIndex + GENRES_PER_PAGE;
        return genresList.slice(startIndex, endIndex);
    }, [genresList, currentPage]);

    const genreMoviesQueries = useQueries({
        queries: paginatedGenres.map((genre: Genre) => ({
            queryKey: ["genreMovies", genre.id],
            queryFn: () => QueryService.getMoviesByGenre(genre.id) as Promise<MovieResponse>,
            enabled: !!genresData,
            staleTime: 5 * 60 * 1000,
            cacheTime: 10 * 60 * 1000,
        }))
    });

    useEffect(() => {
        genreMoviesQueries.forEach((query, index) => {
            if (query.data && !query.isLoading && query.isSuccess) {
                const genre = paginatedGenres[index];
                if (genre && !loadedGenres.has(genre.id)) {
                    setLoadedGenres(prev => new Set([...prev, genre.id]));
                }
            }
        });
    }, [genreMoviesQueries, paginatedGenres, loadedGenres]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        const genresSection = document.getElementById('genres-section');
        if (genresSection) {
            genresSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleLoadMore = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
        }
    };

    if (moviesLoading || genresLoading) {
        return (
            <Loading />
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center text-red-600">
                    <p className="text-xl mb-2">⚠️ Something went wrong</p>
                    <p>Error: {error.message}</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <HomeHeroSection />
            <div className="flex flex-col max-w-7xl mx-auto md:mt-12 mt-8 px-4 md:px-0">
                <EmailConfirmationModal />
                <Section
                    title="🔥 Daily Trending"
                    movies={moviesData?.results || []}
                />

                <div id="genres-section" className="mt-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Browse by Genre</h2>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Page {currentPage} of {totalPages} • {genresList.length} genres total
                        </div>
                    </div>

                    {paginatedGenres.map((genre: Genre, index: number) => {
                        const queryResult = genreMoviesQueries[index];
                        const genreMovies = queryResult?.data?.results || [];
                        const loading = queryResult?.isLoading || false;

                        return (
                            <div key={genre.id} className="mb-4">
                                <Section
                                    title={genre.name}
                                    movies={loading ? [] : genreMovies}
                                />
                                {loading && (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="animate-pulse flex space-x-4">
                                            {[...Array(5)].map((_, i) => (
                                                <div key={i} className="bg-gray-300 h-64 w-44 rounded-lg"></div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {totalPages > 1 && (
                        <div className="flex flex-col items-center space-y-4 mt-12 mb-8">
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Previous
                                </button>

                                <div className="flex space-x-1">
                                    {[...Array(totalPages)].map((_, index) => {
                                        const page = index + 1;
                                        const isCurrentPage = page === currentPage;
                                        const showPage =
                                            page === 1 ||
                                            page === totalPages ||
                                            Math.abs(page - currentPage) <= 1;

                                        if (!showPage && page === 2 && currentPage > 4) {
                                            return <span key={page} className="px-2">...</span>;
                                        }

                                        if (!showPage && page === totalPages - 1 && currentPage < totalPages - 3) {
                                            return <span key={page} className="px-2">...</span>;
                                        }

                                        if (!showPage) return null;

                                        return (
                                            <button
                                                key={page}
                                                onClick={() => handlePageChange(page)}
                                                className={`px-4 py-2 rounded-lg transition-colors ${isCurrentPage
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-200 hover:bg-gray-300'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                </button>
                            </div>

                            {currentPage < totalPages && (
                                <button
                                    onClick={handleLoadMore}
                                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:scale-105 transition-transform shadow-lg"
                                >
                                    Load More Genres ({totalPages - currentPage} remaining)
                                </button>
                            )}

                            <div className="w-full max-w-md">
                                <div className="flex justify-between text-sm text-gray-600 mb-2">
                                    <span>Progress</span>
                                    <span>{currentPage}/{totalPages}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${(currentPage / totalPages) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default HomePageContent;
