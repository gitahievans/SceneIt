"use client"

import React, { useEffect, useState } from 'react'

import { QueryService } from './services/queryClient';
import { MovieItem } from '@/types/types';
import MovieCard from '@/Components/MovieCard';
import { Carousel } from '@mantine/carousel';
import { ActionIcon } from '@mantine/core';
import { DynamicIcon } from 'lucide-react/dynamic';

const HomePage = () => {
  const { getDailyTrending, getWeeklyTrending } = QueryService;
  const [dailyTrendingMovies, setDailyTrendingMovies] = useState<MovieItem[]>([]);
  const [weeklyTrendingMovies, setWeeklyTrendingMovies] = useState<MovieItem[]>([]);
  const icon = 'trending';
  const gradient = 'from-blue-600 to-purple-600';

  useEffect(() => {
    getDailyTrending().then((data) => {
      setDailyTrendingMovies(data.results)
    });
    getWeeklyTrending().then((data) => {
      setWeeklyTrendingMovies(data.results)
    });
  }, []);

  return (
    <div className="flex flex-col max-w-7xl mx-auto">
      <h1>All Movies</h1>
      <Carousel
                slideSize={{
                    base: '45%',      // Mobile: ~2 cards visible
                    xs: '45%',        // Small mobile: 3+ cards
                    sm: '45%',        // Tablet: ~2 cards
                    md: '30%',        // Small desktop: ~3 cards
                    lg: '24%',        // Desktop: 4+ cards
                    xl: '18%',        // Large desktop: 5+ cards
                }}
                slideGap={{
                    base: 'xs',       // Smaller gap on mobile
                    sm: 'sm', 
                    md: 'md',
                    lg: 'lg',
                }}
                withIndicators={false}  // Remove bottom indicators for cleaner look
                withControls
                controlsOffset="xs"     // Smaller offset on mobile
                controlSize={36}        // Smaller controls on mobile
                nextControlIcon={
                    <ActionIcon 
                        size={32}       // Smaller size for mobile
                        radius="xl" 
                        variant="filled"
                        className={`bg-gradient-to-r ${gradient} hover:scale-110 transition-transform shadow-lg`}
                    >
                        <DynamicIcon name="chevron-right" size={18} color='white' />
                    </ActionIcon>
                }
                previousControlIcon={
                    <ActionIcon 
                        size={32}       // Smaller size for mobile
                        radius="xl" 
                        variant="filled"
                        className={`bg-gradient-to-r ${gradient} hover:scale-110 transition-transform shadow-lg`}
                    >
                        <DynamicIcon name="chevron-left" size={18} color='white' />
                    </ActionIcon>
                }
                classNames={{
                    root: 'relative',
                    controls: 'opacity-0 group-hover:opacity-100 transition-opacity duration-300',
                    control: 'border-0 shadow-2xl backdrop-blur-sm',
                    slide: 'flex items-stretch', // Ensure all cards have same height
                }}
                className="group" // Add group class for hover effects
            >
                {dailyTrendingMovies.map((movie) => (
                    <Carousel.Slide key={movie.id}>
                        <div className="h-full flex">
                            <MovieCard movie={movie} />
                        </div>
                    </Carousel.Slide>
                ))}
            </Carousel>
    </div>
  )
}

export default HomePage