"use client"

import React, { useEffect, useState } from 'react'

import { QueryService } from './services/queryClient';
import { MovieItem } from '@/types/types';

const HomePage = () => {
  const [dailyTrendingMovies, setDailyTrendingMovies] = useState<MovieItem[]>([]);
  const [weeklyTrendingMovies, setWeeklyTrendingMovies] = useState<MovieItem[]>([]);

  useEffect(() => {
    const dailyTrendingMovies = QueryService.getDailyTrending().then((data) => {
      console.log(data)
      setDailyTrendingMovies(data)
    });
    const weeklyTrendingMovies = QueryService.getWeeklyTrending().then((data) => {
      console.log(data)
      setWeeklyTrendingMovies(data)
    });
  }, []);

  return (
    <div>{JSON.stringify(dailyTrendingMovies)}</div>
  )
}

export default HomePage