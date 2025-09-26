"use client";

import { Carousel } from "@mantine/carousel";
import { ActionIcon } from "@mantine/core";
import { DynamicIcon } from "lucide-react/dynamic";
import { memo } from "react";
import { MovieItem } from "@/types/types";
import MovieCard from "./MovieCard";

type SectionProps = {
  title: string;
  movies: MovieItem[];
  isLoading?: boolean;
  showViewAll?: boolean;
  onViewAll?: () => void;
};

const gradient = "from-blue-600 to-purple-600";

const LoadingSkeleton = memo(() => (
  <div className="flex space-x-4 animate-pulse">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex-shrink-0">
        <div className="bg-gray-300 h-64 w-44 rounded-lg mb-2"></div>
        <div className="bg-gray-300 h-4 w-44 rounded mb-1"></div>
        <div className="bg-gray-300 h-3 w-32 rounded"></div>
      </div>
    ))}
  </div>
));

const Section = memo(({ title, movies, isLoading = false, showViewAll = false, onViewAll }: SectionProps) => {
  if (!isLoading && (!movies || movies.length === 0)) {
    return null;
  }

  return (
    <section className="my-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="md:text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
        {showViewAll && movies.length > 0 && (
          <button
            onClick={onViewAll}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center space-x-1 transition-colors"
          >
            <span>View All</span>
            <DynamicIcon name="arrow-right" size={16} />
          </button>
        )}
        {!isLoading && movies.length > 0 && (
          <span className="hidden md:block text-sm text-gray-500 dark:text-gray-400">
            {movies.length} {movies.length === 1 ? 'movie' : 'movies'}
          </span>
        )}
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <Carousel
          slideSize={{
            base: "45%",
            sm: "40%",
            md: "30%",
            lg: "20%",
            xl: "18%",
          }}
          slideGap="md"
          withIndicators={false}
          withControls={movies.length > 5}
          controlsOffset="xs"
          controlSize={36}
          nextControlIcon={
            <ActionIcon
              size={32}
              radius="xl"
              variant="filled"
              className={`bg-gradient-to-r ${gradient} hover:scale-110 transition-transform shadow-lg`}
            >
              <DynamicIcon name="chevron-right" size={18} color="white" />
            </ActionIcon>
          }
          previousControlIcon={
            <ActionIcon
              size={32}
              radius="xl"
              variant="filled"
              className={`bg-gradient-to-r ${gradient} hover:scale-110 transition-transform shadow-lg`}
            >
              <DynamicIcon name="chevron-left" size={18} color="white" />
            </ActionIcon>
          }
          classNames={{
            root: "relative",
            controls:
              "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
            control: "border-0 shadow-2xl backdrop-blur-sm",
            slide: "flex items-stretch",
          }}
          className="group"
        >
          {movies.map((movie, index) => (
            <Carousel.Slide key={`${movie.id}-${index}`}>
              <div className="h-full flex">
                <MovieCard movie={movie} />
              </div>
            </Carousel.Slide>
          ))}
        </Carousel>
      )}
    </section>
  );
});

Section.displayName = 'Section';

export default Section;