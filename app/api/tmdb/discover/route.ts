import { NextResponse } from "next/server";
import { toSearchParams, tmdbServer } from "@/utils/tmdb/server";

const DISCOVER_KEYS = [
  "page",
  "sort_by",
  "with_genres",
  "year",
  "primary_release_year",
  "vote_average.gte",
  "vote_count.gte",
  "with_runtime.gte",
  "with_runtime.lte",
  "watch_region",
  "with_watch_providers",
  "with_watch_monetization_types",
  "with_keywords",
  "with_cast",
  "with_crew",
  "with_companies",
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const params = toSearchParams(searchParams, DISCOVER_KEYS, {
      page: "1",
      sort_by: "popularity.desc",
      watch_region: "US",
    });

    const data = await tmdbServer.discoverMovies(params);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to discover movies";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
