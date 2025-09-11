"use client";

import { Carousel } from "@mantine/carousel";
import { ActionIcon } from "@mantine/core";
import { DynamicIcon } from "lucide-react/dynamic";
import MovieCard from "./MovieCard";
import { MovieItem } from "@/types/types";

type SectionProps = {
  title: string;
  movies: MovieItem[];
};

const gradient = "from-blue-600 to-purple-600";

export default function Section({ title, movies }: SectionProps) {
  console.log(movies);

  return (
    <section className="my-8">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
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
        withControls
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
        {movies.map((movie) => (
          <Carousel.Slide key={movie.id}>
            <div className="h-full flex">
              <MovieCard movie={movie} />
            </div>
          </Carousel.Slide>
        ))}
      </Carousel>
    </section>
  );
}
