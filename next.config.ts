import type { NextConfig } from "next";

// TMDB's movie genre IDs are fixed; slugs match slugify(genre.name).
const TMDB_MOVIE_GENRES: Record<string, string> = {
  28: "action", 12: "adventure", 16: "animation", 35: "comedy", 80: "crime",
  99: "documentary", 18: "drama", 10751: "family", 14: "fantasy", 36: "history",
  27: "horror", 10402: "music", 9648: "mystery", 10749: "romance",
  878: "science-fiction", 10770: "tv-movie", 53: "thriller", 10752: "war", 37: "western",
};

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
    ],
  },
  output: 'standalone',
  // Legacy URLs used to render a page just to issue a redirect, costing a
  // function run and an ISR write per URL. Redirect at the edge instead.
  async redirects() {
    return [
      { source: "/details/:id(\\d+)", destination: "/movies/:id", permanent: true },
      ...Object.entries(TMDB_MOVIE_GENRES).map(([id, slug]) => ({
        source: `/genres/${id}`,
        destination: `/movies/genres/${slug}`,
        permanent: true,
      })),
    ];
  },
};

export default nextConfig;

