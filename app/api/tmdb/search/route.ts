import { NextResponse } from "next/server";
import { enrichMoviesWithRuntime, tmdbServer } from "@/utils/tmdb/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");
    const page = searchParams.get("page") || "1";
    const kind = searchParams.get("kind") === "tv" ? "tv" : "movie";

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const data = kind === "tv" ? await tmdbServer.searchTv(query, page) : await tmdbServer.searchMovies(query, page);
    return NextResponse.json(kind === "movie" ? await enrichMoviesWithRuntime(data) : data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to search movies";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
