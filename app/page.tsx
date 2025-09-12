"use client"

import React from 'react'

import { QueryService } from './services/queryClient';
import { useQueries, useQuery } from '@tanstack/react-query';
import Section from '@/components/Section';
import { MovieResponse, Genre, GenreResponse } from '@/types/types';
import Navbar from '@/components/Navbar';
import EmailConfirmationModal from '@/components/EmailConfirmationModal';

const HomePage = () => {
  const { getMoviesByGenre } = QueryService;
  
  const { data: moviesData, isLoading: moviesLoading, error } = useQuery<MovieResponse>({
    queryKey: ['movies'],
    queryFn: QueryService.getDailyTrending as () => Promise<MovieResponse>,
  });

  const { data: genresData, isLoading: genresLoading } = useQuery<GenreResponse>({
    queryKey: ['genres'],
    queryFn: QueryService.getGenres as () => Promise<GenreResponse>,
  });

  console.log("moviesData", moviesData);
  console.log("genresData", genresData);
  

  const genresList = genresData?.genres || [];

  const genreQueries = useQueries({
    queries: genresList.map((genre: Genre) => ({
      queryKey: ["genreMovies", genre.id],
      queryFn: () => getMoviesByGenre(genre.id) as Promise<MovieResponse>,
      enabled: !!genresData,
    }))
  });

  if (moviesLoading || genresLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;


  return (
    <div className="flex flex-col max-w-7xl mx-auto p-6">
      <Navbar />
      <EmailConfirmationModal />
      <Section
        title="🔥 Daily Trending"
        movies={moviesData?.results || []}
      />
      {
        genresList.map((genre: Genre, index: number) => {
          const genreMovies = genreQueries[index].data?.results || [];
          const loading = genreQueries[index].isLoading;

          return (
            <Section
              key={genre.id}
              title={genre.name}
              movies={loading ? [] : genreMovies}
            />
          )
        })
      }
    </div>
  )
}

export default HomePage;