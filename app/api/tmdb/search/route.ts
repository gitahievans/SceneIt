import { NextResponse } from "next/server";
import { enrichMoviesWithRuntime, tmdbServer } from "@/utils/tmdb/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");
    const page = searchParams.get("page") || "1";

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const data = await tmdbServer.searchMovies(query, page);
    return NextResponse.json(await enrichMoviesWithRuntime(data));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to search movies";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
