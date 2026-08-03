import { NextResponse } from "next/server";
import { tmdbServer } from "@/utils/tmdb/server";

export async function GET(request: Request) {
  try {
    const kind = new URL(request.url).searchParams.get("kind") === "tv" ? "tv" : "movie";
    const data = await tmdbServer.genresFor(kind);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch genres";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
