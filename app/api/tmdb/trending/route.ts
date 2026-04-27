import { NextResponse } from "next/server";
import { fetchTmdb } from "@/utils/tmdb/server";
import { MovieResponse } from "@/types/types";

export async function GET() {
  try {
    const data = await fetchTmdb<MovieResponse>("/trending/movie/day");
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch trending movies";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
